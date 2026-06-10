import { Inject, Injectable } from '@nestjs/common';

import type { Prisma } from '../../../../generated/prisma/client.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { assertCanonicalSupportedFuelType } from '../../../../shared/domain/enums/supported-fuel-type.enum.js';
import { assertCanonicalVehicleStatus } from '../../../../shared/domain/enums/vehicle-status.enum.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Money } from '../../../../shared/domain/value-objects/money.value-object.js';
import { createAuditLogEntry } from '../../../../shared/infrastructure/database/audit/create-audit-log.js';
import { VehicleNotFoundError } from '../../domain/errors/vehicle-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { VehicleRepositoryFactory } from '../../infrastructure/persistence/factories/vehicle-repository.factory.js';
import type { UpdateVehicleDto } from '../dto/update-vehicle.dto.js';

@Injectable()
class UpdateVehicleUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly vehicleRepositoryFactory: VehicleRepositoryFactory,
	) {}

	async execute(actorUserId: string, vehicleId: string, dto: UpdateVehicleDto) {
		const result = await this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const tx = transactionContext.client as Prisma.TransactionClient;
			const vehicles = this.vehicleRepositoryFactory.create(transactionContext);

			const vehicle = await vehicles.findById(Uuid.parse(vehicleId));
			if (!vehicle) {
				throw new VehicleNotFoundError(vehicleId);
			}
			const previous = {
				brand: vehicle.brand,
				model: vehicle.model,
				version: vehicle.version,
				modelYear: vehicle.modelYear,
				manufactureYear: vehicle.manufactureYear,
				color: vehicle.color,
				mileage: vehicle.mileage,
				supportedFuelType: vehicle.supportedFuelType,
				price: vehicle.price,
				status: vehicle.status,
				plate: vehicle.plate,
				vin: vehicle.vin,
			};

			const hasInput =
				dto.brand !== undefined ||
				dto.model !== undefined ||
				dto.version !== undefined ||
				dto.modelYear !== undefined ||
				dto.manufactureYear !== undefined ||
				dto.color !== undefined ||
				dto.mileage !== undefined ||
				dto.supportedFuelType !== undefined ||
				dto.price !== undefined ||
				dto.status !== undefined ||
				dto.plate !== undefined ||
				dto.vin !== undefined;

			const imageIdentityChanged =
				(dto.brand !== undefined && dto.brand !== vehicle.brand) ||
				(dto.model !== undefined && dto.model !== vehicle.model) ||
				(dto.modelYear !== undefined && dto.modelYear !== vehicle.modelYear);

			if (!hasInput) {
				return vehicle;
			}

			if (dto.brand !== undefined) {
				vehicle.changeBrand(dto.brand);
			}
			if (dto.model !== undefined) {
				vehicle.changeModel(dto.model);
			}
			if (dto.version !== undefined) {
				vehicle.changeVersion(dto.version);
			}
			if (dto.modelYear !== undefined) {
				vehicle.changeModelYear(dto.modelYear);
			}
			if (dto.manufactureYear !== undefined) {
				vehicle.changeManufactureYear(dto.manufactureYear);
			}
			if (dto.color !== undefined) {
				vehicle.changeColor(dto.color);
			}
			if (dto.mileage !== undefined) {
				vehicle.changeMileage(dto.mileage);
			}
			if (dto.supportedFuelType !== undefined) {
				vehicle.changeSupportedFuelType(
					assertCanonicalSupportedFuelType(dto.supportedFuelType),
				);
			}
			if (dto.price !== undefined) {
				vehicle.changePrice(Money.fromDecimalString(dto.price));
			}
			if (dto.status !== undefined) {
				vehicle.changeStatus(assertCanonicalVehicleStatus(dto.status));
			}
			if (dto.plate !== undefined) {
				vehicle.changePlate(dto.plate);
			}
			if (dto.vin !== undefined) {
				vehicle.changeVin(dto.vin);
			}
			if (imageIdentityChanged) {
				vehicle.changeImageMetadata(null);
			}

			const changedFields = [
				previous.brand !== vehicle.brand ? 'brand' : null,
				previous.model !== vehicle.model ? 'model' : null,
				previous.version !== vehicle.version ? 'version' : null,
				previous.modelYear !== vehicle.modelYear ? 'modelYear' : null,
				previous.manufactureYear !== vehicle.manufactureYear
					? 'manufactureYear'
					: null,
				previous.color !== vehicle.color ? 'color' : null,
				previous.mileage !== vehicle.mileage ? 'mileage' : null,
				previous.supportedFuelType !== vehicle.supportedFuelType
					? 'supportedFuelType'
					: null,
				!previous.price.equals(vehicle.price) ? 'price' : null,
				previous.status !== vehicle.status ? 'status' : null,
				previous.plate !== vehicle.plate ? 'plate' : null,
				previous.vin !== vehicle.vin ? 'vin' : null,
			].filter((field): field is string => field !== null);

			if (changedFields.length === 0) {
				return vehicle;
			}

			const updated = await vehicles.update(vehicle);
			await createAuditLogEntry(tx, {
				actorUserId,
				action:
					changedFields.length === 1 && changedFields[0] === 'status'
						? 'STATUS_CHANGE'
						: 'UPDATE',
				entityName: 'Vehicle',
				entityId: updated.id.value,
				metadata: {
					changedFields,
					...(previous.status !== updated.status && {
						fromStatus: previous.status,
						toStatus: updated.status,
					}),
				},
			});

			return updated;
		});
		return result;
	}
}

export { UpdateVehicleUseCase };
