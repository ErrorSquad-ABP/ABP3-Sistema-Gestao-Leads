import { Injectable } from '@nestjs/common';

import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadAccessPolicy } from '../../../leads/application/services/lead-access-policy.service.js';
import type { StoreRepositoryFactory } from '../../infrastructure/persistence/factories/store-repository.factory.js';

@Injectable()
class ListStoreMetricsUseCase {
	constructor(
		private readonly leadAccessPolicy: LeadAccessPolicy,
		private readonly storeRepositoryFactory: StoreRepositoryFactory,
	) {}

	async execute(actor: LeadActor) {
		const scope = await this.leadAccessPolicy.resolveCatalogScope(actor);
		const stores = this.storeRepositoryFactory.create();
		const metrics = await stores.listMetrics();

		if (scope.kind === 'full') {
			return metrics;
		}

		const allowedStoreIds = scope.readStoreIds;
		return metrics.filter((item) => allowedStoreIds.has(item.storeId));
	}
}

export { ListStoreMetricsUseCase };
