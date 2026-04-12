import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest DI — classes must exist at runtime for constructor metadata
import { CustomerRepositoryFactory } from '../../infrastructure/persistence/factories/customer-repository.factory.js';

@Injectable()
class DeleteCustomerUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly customerRepositoryFactory: CustomerRepositoryFactory,
	) {}

	async execute(id: string) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const customers =
				this.customerRepositoryFactory.create(transactionContext);

			const existing = await customers.findById(Uuid.parse(id));
			if (!existing) {
				throw new CustomerNotFoundError(id);
			}

			return customers.delete(existing.id);
		});
	}
}

export { DeleteCustomerUseCase };
