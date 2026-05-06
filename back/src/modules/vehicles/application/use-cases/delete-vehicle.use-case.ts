import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { VehicleDeleteBlockedError } from '../../domain/errors/vehicle-delete-blocked.error.js';
import { VehicleNotFoundError } from '../../domain/errors/vehicle-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { VehicleRepositoryFactory } from '../../infrastructure/persistence/factories/vehicle-repository.factory.js';

@Injectable()
class DeleteVehicleUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly vehicleRepositoryFactory: VehicleRepositoryFactory,
	) {}

	async execute(vehicleId: string): Promise<void> {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const vehicles = this.vehicleRepositoryFactory.create(transactionContext);
			const vehicleIdVo = Uuid.parse(vehicleId);

			const vehicle = await vehicles.findById(vehicleIdVo);
			if (!vehicle) {
				throw new VehicleNotFoundError(vehicleId);
			}

			const deals = await vehicles.countDealsByVehicleId(vehicleIdVo);
			if (deals > 0) {
				throw VehicleDeleteBlockedError.withCounts(vehicleId, deals);
			}

			await vehicles.delete(vehicleIdVo);
		});
	}
}

export { DeleteVehicleUseCase };
