import { Injectable } from '@nestjs/common';

import type { LeadActor } from '../types/lead-actor.js';
import { LeadAccessPolicy } from '../services/lead-access-policy.service.js';
import { StoreRepositoryFactory } from '../../../stores/infrastructure/persistence/factories/store-repository.factory.js';

@Injectable()
class ListLeadCatalogStoresUseCase {
	constructor(
		private readonly leadAccessPolicy: LeadAccessPolicy,
		private readonly storeRepositoryFactory: StoreRepositoryFactory,
	) {}

	async execute(actor: LeadActor) {
		const scope = await this.leadAccessPolicy.resolveCatalogScope(actor);
		const stores = this.storeRepositoryFactory.create();

		if (scope.kind === 'full') {
			return stores.list();
		}

		const allowedStoreIds = scope.readStoreIds;
		const allStores = await stores.list();
		return allStores.filter((store) => allowedStoreIds.has(store.id.value));
	}
}

export { ListLeadCatalogStoresUseCase };
