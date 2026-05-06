import { Inject, Injectable } from '@nestjs/common';

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

		for (const item of catalog.items) {
			if (!shouldResolveImage(item.vehicle, now)) {
				continue;
			}

			const imageMetadata = await this.imageProvider.resolve({
				brand: item.vehicle.brand,
				model: item.vehicle.model,
				modelYear: item.vehicle.modelYear,
			});
			item.vehicle.changeImageMetadata(
				imageMetadata ?? failedImageLookupMetadata(new Date()),
			);

			await this.unitOfWork.run(async () => {
				const transactionContext = this.unitOfWork.getTransactionContext();
				const vehicles =
					this.vehicleRepositoryFactory.create(transactionContext);
				await vehicles.update(item.vehicle);
			});
		}

		return catalog;
	}
}

export { ListVehicleCatalogUseCase };
export type { ListVehicleCatalogFilters };
