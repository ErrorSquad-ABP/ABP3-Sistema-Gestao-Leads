import { Inject, Injectable } from '@nestjs/common';

import type { Prisma } from '../../../../generated/prisma/client.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { createAuditLogEntry } from '../../../../shared/infrastructure/database/audit/create-audit-log.js';
import { StoreDeleteBlockedError } from '../../domain/errors/store-delete-blocked.error.js';
import { StoreNotFoundError } from '../../domain/errors/store-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { StoreRepositoryFactory } from '../../infrastructure/persistence/factories/store-repository.factory.js';

@Injectable()
class DeleteStoreUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly storeRepositoryFactory: StoreRepositoryFactory,
	) {}

	async execute(actorUserId: string, storeId: string): Promise<void> {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const tx = transactionContext.client as Prisma.TransactionClient;
			const stores = this.storeRepositoryFactory.create(transactionContext);

			const storeIdVo = Uuid.parse(storeId);
			const store = await stores.findById(storeIdVo);
			if (!store) {
				throw new StoreNotFoundError(storeId);
			}

			const counts = await stores.countBlockingReferences(storeIdVo);
			if (counts.leads > 0 || counts.teams > 0) {
				throw StoreDeleteBlockedError.withCounts(storeId, counts);
			}

			await createAuditLogEntry(tx, {
				actorUserId,
				action: 'DELETE',
				entityName: 'Store',
				entityId: store.id.value,
				metadata: { name: store.name.value },
			});

			await stores.delete(storeIdVo);
		});
	}
}

export { DeleteStoreUseCase };
