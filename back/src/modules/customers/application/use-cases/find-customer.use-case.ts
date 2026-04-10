import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';
import type { CustomerRepositoryFactory } from '../../infrastructure/persistence/factories/customer-repository.factory.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';

@Injectable()
class FindCustomerUseCase {
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

			const customer = await customers.findById(Uuid.parse(id));
			if (!customer) {
				throw new CustomerNotFoundError(id);
			}

			return customer;
		});
	}
}

export { FindCustomerUseCase };
