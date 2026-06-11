import { Inject, Injectable } from '@nestjs/common';

import type { Prisma } from '../../../../generated/prisma/client.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { createAuditLogEntry } from '../../../../shared/infrastructure/database/audit/create-audit-log.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { StoreFactory } from '../../domain/factories/store.factory.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { StoreRepositoryFactory } from '../../infrastructure/persistence/factories/store-repository.factory.js';
import type { CreateStoreDto } from '../dto/create-store.dto.js';

@Injectable()
class CreateStoreUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly storeFactory: StoreFactory,
		private readonly storeRepositoryFactory: StoreRepositoryFactory,
	) {}

	async execute(actorUserId: string, dto: CreateStoreDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const tx = transactionContext.client as Prisma.TransactionClient;
			const stores = this.storeRepositoryFactory.create(transactionContext);

			const store = this.storeFactory.create(dto);
			const created = await stores.create(store);
			await createAuditLogEntry(tx, {
				actorUserId,
				action: 'CREATE',
				entityName: 'Store',
				entityId: created.id.value,
				metadata: { name: created.name.value },
			});

			return created;
		});
	}
}

export { CreateStoreUseCase };
