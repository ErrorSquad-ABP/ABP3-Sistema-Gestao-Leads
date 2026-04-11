import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import type { Customer } from '../../domain/entities/customer.entity.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { CustomerRepositoryFactory } from '../../infrastructure/persistence/factories/customer-repository.factory.js';

@Injectable()
class FindCustomerUseCase {
	constructor(
		private readonly customerRepositoryFactory: CustomerRepositoryFactory,
	) {}

	async execute(id: string): Promise<Customer> {
		const repository = this.customerRepositoryFactory.create();
		const customer = await repository.findById(Uuid.parse(id));

		if (!customer) {
			throw new Error(`Customer with id ${id} not found`);
		}

		return customer;
	}
}

export { FindCustomerUseCase };
