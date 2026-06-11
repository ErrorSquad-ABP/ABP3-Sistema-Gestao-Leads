import { Inject, Injectable } from '@nestjs/common';

import type { Prisma } from '../../../../generated/prisma/client.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { createAuditLogEntry } from '../../../../shared/infrastructure/database/audit/create-audit-log.js';
import { VehicleNotFoundError } from '../../domain/errors/vehicle-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { VehicleRepositoryFactory } from '../../infrastructure/persistence/factories/vehicle-repository.factory.js';

@Injectable()
class DeactivateVehicleUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly vehicleRepositoryFactory: VehicleRepositoryFactory,
	) {}

	async execute(actorUserId: string, vehicleId: string): Promise<void> {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const tx = transactionContext.client as Prisma.TransactionClient;
			const vehicles = this.vehicleRepositoryFactory.create(transactionContext);

			const vehicle = await vehicles.findById(Uuid.parse(vehicleId));
			if (!vehicle) {
				throw new VehicleNotFoundError(vehicleId);
			}

			vehicle.deactivate();
			await vehicles.update(vehicle);
			await createAuditLogEntry(tx, {
				actorUserId,
				action: 'STATUS_CHANGE',
				entityName: 'Vehicle',
				entityId: vehicle.id.value,
				metadata: { status: vehicle.status },
			});
		});
	}
}

export { DeactivateVehicleUseCase };
