import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadAccessPolicy } from '../../../leads/application/services/lead-access-policy.service.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import type { DealListScopedFilters } from '../../domain/repositories/deal.repository.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { DealRepositoryFactory } from '../../infrastructure/persistence/factories/deal-repository.factory.js';

@Injectable()
class GetDealsMetricsUseCase {
	constructor(
		private readonly dealRepositoryFactory: DealRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	async execute(actor: LeadActor) {
		const scope = await this.leadAccessPolicy.resolveCatalogScope(actor);
		const filters: DealListScopedFilters =
			scope.kind === 'full'
				? {}
				: scope.kind === 'attendant'
					? { ownerUserId: actor.userId }
					: { storeIds: [...scope.readStoreIds] };

		return this.dealRepositoryFactory.create().metricsScoped(filters);
	}
}

export { GetDealsMetricsUseCase };
