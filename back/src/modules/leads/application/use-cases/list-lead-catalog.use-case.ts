import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import type {
	LeadCatalogSort,
	LeadCatalogSource,
	LeadCatalogStatus,
} from '../../domain/repositories/lead.repository.js';
// biome-ignore lint/style/useImportType: Nest DI
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest DI
import { LeadAccessPolicy } from '../services/lead-access-policy.service.js';
import type { LeadActor } from '../types/lead-actor.js';

type ListLeadCatalogFilters = {
	readonly search?: string;
	readonly status?: LeadCatalogStatus;
	readonly source?: LeadCatalogSource;
	readonly storeId?: string;
	readonly ownerUserId?: string;
	readonly activityStartDate?: Date;
	readonly activityEndDate?: Date;
	readonly sort?: LeadCatalogSort;
	readonly page?: number;
	readonly limit?: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

@Injectable()
class ListLeadCatalogUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	async execute(actor: LeadActor, filters: ListLeadCatalogFilters) {
		const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
		const limit = Math.min(
			MAX_LIMIT,
			Math.max(1, filters.limit ?? DEFAULT_LIMIT),
		);
		const scope = await this.leadAccessPolicy.resolveCatalogListScope(actor);

		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const leads = this.leadRepositoryFactory.create(transactionContext);

			return leads.listCatalog(
				{
					scope,
					search: filters.search,
					status: filters.status,
					source: filters.source,
					storeId: filters.storeId ? Uuid.parse(filters.storeId) : undefined,
					ownerUserId: filters.ownerUserId
						? Uuid.parse(filters.ownerUserId)
						: undefined,
					activityStartDate: filters.activityStartDate,
					activityEndDate: filters.activityEndDate,
					sort: filters.sort ?? 'recent',
				},
				{ page, limit },
			);
		});
	}
}

export { ListLeadCatalogUseCase };
export type { ListLeadCatalogFilters };
