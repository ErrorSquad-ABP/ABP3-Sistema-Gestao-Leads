import { Injectable } from '@nestjs/common';

import type { CustomerRepositoryFactory } from '../../infrastructure/persistence/factories/customer-repository.factory.js';

@Injectable()
class ListCustomersUseCase {
	constructor(
		private readonly customerRepositoryFactory: CustomerRepositoryFactory,
	) {}

	execute() {
		const customers = this.customerRepositoryFactory.create();
		return customers.list();
	}
}

export { ListCustomersUseCase };
