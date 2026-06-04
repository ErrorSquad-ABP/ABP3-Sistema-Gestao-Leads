import { Inject, Injectable } from '@nestjs/common';

import type { Prisma } from '../../../../generated/prisma/client.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { DomainValidationError } from '../../../../shared/domain/errors/domain-validation.error.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { createAuditLogEntry } from '../../../../shared/infrastructure/database/audit/create-audit-log.js';
import { StoreNotFoundError } from '../../domain/errors/store-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { StoreRepositoryFactory } from '../../infrastructure/persistence/factories/store-repository.factory.js';
import type { UpdateStoreDto } from '../dto/update-store.dto.js';

function hasStoreUpdatePayload(dto: UpdateStoreDto): boolean {
	return dto.name !== undefined;
}

@Injectable()
class UpdateStoreUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly storeRepositoryFactory: StoreRepositoryFactory,
	) {}

	async execute(actorUserId: string, storeId: string, dto: UpdateStoreDto) {
		if (!hasStoreUpdatePayload(dto)) {
			throw new DomainValidationError(
				'Informe ao menos um campo para atualizar a loja.',
				{ code: 'store.update.no_fields' },
			);
		}

		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const tx = transactionContext.client as Prisma.TransactionClient;
			const stores = this.storeRepositoryFactory.create(transactionContext);

			const existing = await stores.findById(Uuid.parse(storeId));
			if (!existing) {
				throw new StoreNotFoundError(storeId);
			}

			if (dto.name !== undefined) {
				const next = Name.create(dto.name);
				if (next.equals(existing.name)) {
					return existing;
				}
				existing.rename(next);
			}

			const updated = await stores.update(existing);
			await createAuditLogEntry(tx, {
				actorUserId,
				action: 'UPDATE',
				entityName: 'Store',
				entityId: updated.id.value,
				metadata: { changedFields: ['name'] },
			});

			return updated;
		});
	}
}

export { UpdateStoreUseCase };
