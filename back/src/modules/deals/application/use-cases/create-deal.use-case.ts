import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { createAuditLogEntry } from '../../../../shared/infrastructure/database/audit/create-audit-log.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { LeadNotFoundError } from '../../../leads/domain/errors/lead-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadRepositoryFactory } from '../../../leads/infrastructure/persistence/factories/lead-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadAccessPolicy } from '../../../leads/application/services/lead-access-policy.service.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import { ActiveDealAlreadyExistsError } from '../../domain/errors/active-deal-already-exists.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { DealFactory } from '../../domain/factories/deal.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { DealRepositoryFactory } from '../../infrastructure/persistence/factories/deal-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { DealHistoryRepositoryFactory } from '../../infrastructure/persistence/factories/deal-history-repository.factory.js';
import { initialDealHistory } from '../helpers/deal-history.helpers.js';
import type { CreateDealDto } from '../dto/create-deal.dto.js';

@Injectable()
class CreateDealUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly dealFactory: DealFactory,
		private readonly dealRepositoryFactory: DealRepositoryFactory,
		private readonly dealHistoryRepositoryFactory: DealHistoryRepositoryFactory,
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	async execute(actor: LeadActor, leadId: string, dto: CreateDealDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const tx = transactionContext.client as Prisma.TransactionClient;
			const leads = this.leadRepositoryFactory.create(transactionContext);
			const deals = this.dealRepositoryFactory.create(transactionContext);
			const history =
				this.dealHistoryRepositoryFactory.create(transactionContext);

			const lead = await leads.findById(Uuid.parse(leadId));
			if (!lead) {
				throw new LeadNotFoundError(leadId);
			}
			await this.leadAccessPolicy.assertCanMutateLead(actor, lead);

			const existingOpen = await deals.findOpenByLeadId(Uuid.parse(leadId));
			if (existingOpen) {
				throw new ActiveDealAlreadyExistsError(leadId);
			}

			const deal = this.dealFactory.create({
				leadId,
				title: dto.title,
				value: dto.value,
				importance: dto.importance,
				stage: dto.stage,
			});

			const created = await deals.create(deal);
			const actorUuid = Uuid.parse(actor.userId);
			await history.appendMany(initialDealHistory(created, actorUuid));

			await createAuditLogEntry(tx, {
				actorUserId: actor.userId,
				action: 'CREATE',
				entityName: 'Deal',
				entityId: created.id.value,
				metadata: { leadId },
			});

			return created;
		});
	}
}

export { CreateDealUseCase };
