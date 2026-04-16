import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { assertCanonicalDealImportance } from '../../../../shared/domain/enums/deal-importance.enum.js';
import { assertCanonicalDealStage } from '../../../../shared/domain/enums/deal-stage.enum.js';
import { assertCanonicalDealStatus } from '../../../../shared/domain/enums/deal-status.enum.js';
import { createAuditLogEntry } from '../../../../shared/infrastructure/database/audit/create-audit-log.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { LeadNotFoundError } from '../../../leads/domain/errors/lead-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadRepositoryFactory } from '../../../leads/infrastructure/persistence/factories/lead-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadAccessPolicy } from '../../../leads/application/services/lead-access-policy.service.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import { DealNotFoundError } from '../../domain/errors/deal-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { DealRepositoryFactory } from '../../infrastructure/persistence/factories/deal-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { DealHistoryRepositoryFactory } from '../../infrastructure/persistence/factories/deal-history-repository.factory.js';
import {
	diffDealHistory,
	snapshotDeal,
} from '../helpers/deal-history.helpers.js';
import type { UpdateDealDto } from '../dto/update-deal.dto.js';

@Injectable()
class UpdateDealUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly dealRepositoryFactory: DealRepositoryFactory,
		private readonly dealHistoryRepositoryFactory: DealHistoryRepositoryFactory,
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	async execute(actor: LeadActor, dealId: string, dto: UpdateDealDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const tx = transactionContext.client as Prisma.TransactionClient;
			const deals = this.dealRepositoryFactory.create(transactionContext);
			const history =
				this.dealHistoryRepositoryFactory.create(transactionContext);
			const leads = this.leadRepositoryFactory.create(transactionContext);

			const deal = await deals.findById(Uuid.parse(dealId));
			if (!deal) {
				throw new DealNotFoundError(dealId);
			}
			const lead = await leads.findById(deal.leadId);
			if (!lead) {
				throw new LeadNotFoundError(deal.leadId.value);
			}
			await this.leadAccessPolicy.assertCanMutateLead(actor, lead);

			const hasInput =
				dto.title !== undefined ||
				dto.value !== undefined ||
				dto.importance !== undefined ||
				dto.stage !== undefined ||
				dto.status !== undefined;
			if (!hasInput) {
				return deal;
			}

			const before = snapshotDeal(deal);

			if (dto.title !== undefined) {
				deal.changeTitle(dto.title);
			}
			if (dto.value !== undefined) {
				deal.changeValue(dto.value);
			}
			if (dto.importance !== undefined) {
				deal.changeImportance(assertCanonicalDealImportance(dto.importance));
			}
			if (dto.stage !== undefined) {
				deal.changeStage(assertCanonicalDealStage(dto.stage));
			}
			if (dto.status !== undefined) {
				deal.changeStatus(assertCanonicalDealStatus(dto.status));
			}

			const after = snapshotDeal(deal);

			if (
				before.status === 'OPEN' &&
				after.status === 'WON' &&
				!lead.isConverted()
			) {
				lead.convert();
				await leads.update(lead);
			}

			const updated = await deals.update(deal);

			const actorUuid = Uuid.parse(actor.userId);
			const lines = diffDealHistory(updated.id, before, after, actorUuid);
			if (lines.length > 0) {
				await history.appendMany(lines);
			}

			if (lines.length > 0) {
				await createAuditLogEntry(tx, {
					actorUserId: actor.userId,
					action: 'UPDATE',
					entityName: 'Deal',
					entityId: updated.id.value,
					metadata: {
						changedFields: lines.map((l) => l.field),
					},
				});
			}

			return updated;
		});
	}
}

export { UpdateDealUseCase };
