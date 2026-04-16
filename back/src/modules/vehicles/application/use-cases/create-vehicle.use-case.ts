import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { VehicleFactory } from '../../domain/factories/vehicle.factory.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { VehicleRepositoryFactory } from '../../infrastructure/persistence/factories/vehicle-repository.factory.js';
import type { CreateVehicleDto } from '../dto/create-vehicle.dto.js';

@Injectable()
class CreateVehicleUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly vehicleFactory: VehicleFactory,
		private readonly vehicleRepositoryFactory: VehicleRepositoryFactory,
	) {}

	async execute(dto: CreateVehicleDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const vehicles = this.vehicleRepositoryFactory.create(transactionContext);

			const vehicle = this.vehicleFactory.create(dto);
			return vehicles.create(vehicle);
		});
	}
}

export { CreateVehicleUseCase };
