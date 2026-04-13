import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest DI
import { CustomerRepositoryFactory } from '../../infrastructure/persistence/factories/customer-repository.factory.js';

@Injectable()
class DeleteCustomerUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly customerRepositoryFactory: CustomerRepositoryFactory,
	) {}

	async execute(customerId: string): Promise<void> {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const customers =
				this.customerRepositoryFactory.create(transactionContext);

			const idVo = Uuid.parse(customerId);
			const existing = await customers.findById(idVo);
			if (!existing) {
				throw new CustomerNotFoundError(customerId);
			}

			await customers.delete(idVo);
		});
	}
}

export { DeleteCustomerUseCase };
