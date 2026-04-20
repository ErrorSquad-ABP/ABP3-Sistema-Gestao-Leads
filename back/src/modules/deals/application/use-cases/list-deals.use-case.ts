import { Injectable } from '@nestjs/common';

import { LeadAccessDeniedError } from '../../../leads/domain/errors/lead-access-denied.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadAccessPolicy } from '../../../leads/application/services/lead-access-policy.service.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { DealRepositoryFactory } from '../../infrastructure/persistence/factories/deal-repository.factory.js';

type ListDealsQuery = {
	readonly storeId?: string;
	readonly ownerUserId?: string;
	readonly status?: 'OPEN' | 'WON' | 'LOST';
	readonly page: number;
	readonly limit: number;
};

@Injectable()
class ListDealsUseCase {
	constructor(
		private readonly dealRepositoryFactory: DealRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	async execute(actor: LeadActor, query: ListDealsQuery) {
		const scope = await this.leadAccessPolicy.resolveCatalogScope(actor);
		const deals = this.dealRepositoryFactory.create();

		if (scope.kind === 'full') {
			return deals.listScopedEnriched(
				{
					storeIds: query.storeId ? [query.storeId] : undefined,
					ownerUserId: query.ownerUserId,
					status: query.status,
				},
				{ page: query.page, limit: query.limit },
			);
		}

		if (scope.kind === 'attendant') {
			if (query.ownerUserId && query.ownerUserId !== actor.userId) {
				throw new LeadAccessDeniedError(
					'Atendentes podem consultar apenas as próprias negociações.',
				);
			}
			if (query.storeId && !scope.readStoreIds.has(query.storeId)) {
				throw new LeadAccessDeniedError(
					'Consulta permitida apenas para lojas dentro do seu escopo.',
				);
			}
			return deals.listScopedEnriched(
				{
					storeIds: query.storeId ? [query.storeId] : undefined,
					ownerUserId: actor.userId,
					status: query.status,
				},
				{ page: query.page, limit: query.limit },
			);
		}

		// manager/general_manager: restringir a stores do escopo
		const allowedStoreIds = [...scope.readStoreIds];
		if (query.storeId && !scope.readStoreIds.has(query.storeId)) {
			throw new LeadAccessDeniedError(
				'Consulta permitida apenas para lojas dentro do seu escopo.',
			);
		}

		if (query.ownerUserId) {
			throw new LeadAccessDeniedError(
				'Filtro por ownerUserId disponível apenas para administrador.',
			);
		}

		return deals.listScopedEnriched(
			{
				storeIds: query.storeId ? [query.storeId] : allowedStoreIds,
				status: query.status,
			},
			{ page: query.page, limit: query.limit },
		);
	}
}

export { ListDealsUseCase };
export type { ListDealsQuery };
