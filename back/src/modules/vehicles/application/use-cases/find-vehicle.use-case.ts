import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { VehicleNotFoundError } from '../../domain/errors/vehicle-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { VehicleRepositoryFactory } from '../../infrastructure/persistence/factories/vehicle-repository.factory.js';

@Injectable()
class FindVehicleUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly vehicleRepositoryFactory: VehicleRepositoryFactory,
	) {}

	async execute(vehicleId: string) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const vehicles = this.vehicleRepositoryFactory.create(transactionContext);

			const vehicle = await vehicles.findById(Uuid.parse(vehicleId));
			if (!vehicle) {
				throw new VehicleNotFoundError(vehicleId);
			}
			return vehicle;
		});
	}
}

export { FindVehicleUseCase };
