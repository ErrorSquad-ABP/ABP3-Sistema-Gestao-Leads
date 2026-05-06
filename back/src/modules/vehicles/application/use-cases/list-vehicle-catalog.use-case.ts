import { Inject, Injectable, Logger } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { assertCanonicalVehicleStatus } from '../../../../shared/domain/enums/vehicle-status.enum.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import type {
	Vehicle,
	VehicleImageMetadata,
} from '../../domain/entities/vehicle.entity.js';
import type { VehicleCatalogSort } from '../../domain/repositories/vehicle.repository.js';
// biome-ignore lint/style/useImportType: Nest DI — token em runtime
import { VehicleRepositoryFactory } from '../../infrastructure/persistence/factories/vehicle-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest DI — token em runtime
import { CarImagesVehicleImageProvider } from '../../infrastructure/images/car-images-vehicle-image.provider.js';

type ListVehicleCatalogFilters = {
	readonly storeId?: string;
	readonly status?: string;
	readonly search?: string;
	readonly sort?: VehicleCatalogSort;
	readonly page?: number;
	readonly limit?: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 50;
const IMAGE_REFRESH_MARGIN_MS = 5 * 60 * 1000;
const IMAGE_FAILURE_BACKOFF_MS = 30 * 60 * 1000;
const IMAGE_ENRICH_BATCH_SIZE = 4;

function shouldResolveImage(vehicle: Vehicle, now: Date): boolean {
	if (vehicle.imageUrl && vehicle.imageExpiresAt) {
		return (
			vehicle.imageExpiresAt.getTime() <=
			now.getTime() + IMAGE_REFRESH_MARGIN_MS
		);
	}

	if (!vehicle.imageUrl && vehicle.imageExpiresAt) {
		return vehicle.imageExpiresAt.getTime() <= now.getTime();
	}

	return true;
}

function failedImageLookupMetadata(now: Date): VehicleImageMetadata {
	return {
		imageUrl: null,
		imageAlt: null,
		imageProvider: 'carimages',
		imageProviderPhotoId: null,
		imagePhotographerName: null,
		imagePhotographerUrl: null,
		imageSourceUrl: 'https://carimagesapi.com/',
		imageResolvedAt: now,
		imageExpiresAt: new Date(now.getTime() + IMAGE_FAILURE_BACKOFF_MS),
	};
}

@Injectable()
class ListVehicleCatalogUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;
	private readonly logger = new Logger(ListVehicleCatalogUseCase.name);

	constructor(
		private readonly vehicleRepositoryFactory: VehicleRepositoryFactory,
		private readonly imageProvider: CarImagesVehicleImageProvider,
	) {}

	async execute(filters: ListVehicleCatalogFilters) {
		const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
		const limit = Math.min(
			MAX_LIMIT,
			Math.max(1, filters.limit ?? DEFAULT_LIMIT),
		);

		const catalog = await this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const vehicles = this.vehicleRepositoryFactory.create(transactionContext);

			return vehicles.listCatalog(
				{
					storeId: filters.storeId ? Uuid.parse(filters.storeId) : undefined,
					status: filters.status
						? assertCanonicalVehicleStatus(filters.status)
						: undefined,
					search: filters.search,
					sort: filters.sort ?? 'recent',
				},
				{ page, limit },
			);
		});

		const now = new Date();

		const itemsNeedingImageRefresh = catalog.items.filter((item) =>
			shouldResolveImage(item.vehicle, now),
		);

		for (
			let offset = 0;
			offset < itemsNeedingImageRefresh.length;
			offset += IMAGE_ENRICH_BATCH_SIZE
		) {
			const batch = itemsNeedingImageRefresh.slice(
				offset,
				offset + IMAGE_ENRICH_BATCH_SIZE,
			);

			const outcomes = await Promise.all(
				batch.map(async (item) => {
					try {
						const imageMetadata = await this.imageProvider.resolve({
							brand: item.vehicle.brand,
							model: item.vehicle.model,
							modelYear: item.vehicle.modelYear,
						});
						item.vehicle.changeImageMetadata(
							imageMetadata ?? failedImageLookupMetadata(new Date()),
						);

						await this.unitOfWork.run(async () => {
							const transactionContext =
								this.unitOfWork.getTransactionContext();
							const vehicles =
								this.vehicleRepositoryFactory.create(transactionContext);
							await vehicles.update(item.vehicle);
						});
						return { ok: true as const };
					} catch (reason) {
						return {
							ok: false as const,
							reason,
							vehicleId: item.vehicle.id.value,
						};
					}
				}),
			);

			for (const outcome of outcomes) {
				if (!outcome.ok) {
					this.logger.warn(
						`Falha ao enriquecer/persistir imagem para veículo ${outcome.vehicleId}: ${
							outcome.reason instanceof Error
								? outcome.reason.message
								: String(outcome.reason)
						}`,
					);
				}
			}
		}

		return catalog;
	}
}

export { ListVehicleCatalogUseCase };
export type { ListVehicleCatalogFilters };
