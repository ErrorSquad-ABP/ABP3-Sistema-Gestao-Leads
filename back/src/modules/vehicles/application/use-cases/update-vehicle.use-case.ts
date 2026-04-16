import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { assertCanonicalSupportedFuelType } from '../../../../shared/domain/enums/supported-fuel-type.enum.js';
import { assertCanonicalVehicleStatus } from '../../../../shared/domain/enums/vehicle-status.enum.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Money } from '../../../../shared/domain/value-objects/money.value-object.js';
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

	async execute(vehicleId: string, dto: UpdateVehicleDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const vehicles = this.vehicleRepositoryFactory.create(transactionContext);

			const vehicle = await vehicles.findById(Uuid.parse(vehicleId));
			if (!vehicle) {
				throw new VehicleNotFoundError(vehicleId);
			}

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

			return vehicles.update(vehicle);
		});
	}
}

export { UpdateVehicleUseCase };
