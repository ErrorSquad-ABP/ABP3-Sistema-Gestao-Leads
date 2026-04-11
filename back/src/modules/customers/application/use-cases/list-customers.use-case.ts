import { Injectable } from '@nestjs/common';

import type { Customer } from '../../domain/entities/customer.entity.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { CustomerRepositoryFactory } from '../../infrastructure/persistence/factories/customer-repository.factory.js';

@Injectable()
class ListCustomersUseCase {
	constructor(
		private readonly customerRepositoryFactory: CustomerRepositoryFactory,
	) {}

	execute(): Promise<Customer[]> {
		const customers = this.customerRepositoryFactory.create();
		return customers.list();
	}
}

export { ListCustomersUseCase };
