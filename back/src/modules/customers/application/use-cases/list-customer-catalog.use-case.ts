import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import type {
	CustomerCatalogSort,
	CustomerCatalogStatus,
} from '../../domain/repositories/customer.repository.js';
// biome-ignore lint/style/useImportType: Nest DI
import { CustomerRepositoryFactory } from '../../infrastructure/persistence/factories/customer-repository.factory.js';

type ListCustomerCatalogFilters = {
	readonly search?: string;
	readonly storeId?: string;
	readonly status?: CustomerCatalogStatus;
	readonly sort?: CustomerCatalogSort;
	readonly page?: number;
	readonly limit?: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 50;

@Injectable()
class ListCustomerCatalogUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly customerRepositoryFactory: CustomerRepositoryFactory,
	) {}

	async execute(filters: ListCustomerCatalogFilters) {
		const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
		const limit = Math.min(
			MAX_LIMIT,
			Math.max(1, filters.limit ?? DEFAULT_LIMIT),
		);

		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const customers =
				this.customerRepositoryFactory.create(transactionContext);

			return customers.listCatalog(
				{
					search: filters.search,
					storeId: filters.storeId ? Uuid.parse(filters.storeId) : undefined,
					status: filters.status,
					sort: filters.sort ?? 'recent',
				},
				{ page, limit },
			);
		});
	}
}

export { ListCustomerCatalogUseCase };
export type { ListCustomerCatalogFilters };
