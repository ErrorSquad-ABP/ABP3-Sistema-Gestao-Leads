import { Injectable } from '@nestjs/common';

import { Cpf } from '../../../../shared/domain/value-objects/cpf.value-object.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { Phone } from '../../../../shared/domain/value-objects/phone.value-object.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Customer } from '../../domain/entities/customer.entity.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { CustomerRepositoryFactory } from '../../infrastructure/persistence/factories/customer-repository.factory.js';

interface UpdateCustomerInput {
	readonly name?: string;
	readonly email?: string | null;
	readonly phone?: string | null;
	readonly cpf?: string | null;
}

@Injectable()
class UpdateCustomerUseCase {
	constructor(
		private readonly customerRepositoryFactory: CustomerRepositoryFactory,
	) {}

	async execute(id: string, input: UpdateCustomerInput): Promise<Customer> {
		const repository = this.customerRepositoryFactory.create();
		const customer = await repository.findById(Uuid.parse(id));

		if (!customer) {
			throw new Error(`Customer with id ${id} not found`);
		}

		const updated = new Customer(
			customer.id,
			input.name !== undefined ? Name.create(input.name) : customer.name,
			input.email !== undefined
				? input.email
					? Email.create(input.email)
					: null
				: customer.email,
			input.phone !== undefined
				? input.phone
					? Phone.create(input.phone)
					: null
				: customer.phone,
			input.cpf !== undefined
				? input.cpf
					? Cpf.create(input.cpf)
					: null
				: customer.cpf,
		);

		return repository.update(updated);
	}
}

export { UpdateCustomerUseCase };
