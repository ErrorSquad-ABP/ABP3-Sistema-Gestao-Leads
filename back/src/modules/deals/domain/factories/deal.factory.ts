import { assertCanonicalDealImportance } from '../../../../shared/domain/enums/deal-importance.enum.js';
import { assertCanonicalDealStage } from '../../../../shared/domain/enums/deal-stage.enum.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Deal } from '../entities/deal.entity.js';
import { assertDealCreationStage } from '../policies/deal-stage-transition.policy.js';

type CreateDealParams = {
	readonly leadId: string;
	readonly title: string;
	readonly value: string | null;
	readonly importance?: string;
	readonly stage?: string;
};

class DealFactory {
	create(params: CreateDealParams): Deal {
		const now = new Date();
		const importance = params.importance
			? assertCanonicalDealImportance(params.importance)
			: 'WARM';
		const stage = params.stage
			? assertCanonicalDealStage(params.stage)
			: 'INITIAL_CONTACT';
		assertDealCreationStage(stage);
		return new Deal(
			Uuid.generate(),
			Uuid.parse(params.leadId),
			params.title,
			params.value,
			importance,
			stage,
			'OPEN',
			null,
			now,
			now,
		);
	}
}

export { DealFactory };
export type { CreateDealParams };
