import { Injectable } from '@nestjs/common';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Cpf } from '../../../../shared/domain/value-objects/cpf.value-object.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { Phone } from '../../../../shared/domain/value-objects/phone.value-object.js';
import { Customer } from '../../domain/entities/customer.entity.js';
import { CustomerCpfAlreadyExistsError } from '../../domain/errors/customer-cpf-already-exists.error.js';
import { CustomerEmailAlreadyExistsError } from '../../domain/errors/customer-email-already-exists.error.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { CustomerRepositoryFactory } from '../../infrastructure/persistence/factories/customer-repository.factory.js';

interface CreateCustomerInput {
	readonly name: string;
	readonly email?: string;
	readonly phone?: string;
	readonly cpf?: string;
}

@Injectable()
class CreateCustomerUseCase {
	constructor(
		private readonly customerRepositoryFactory: CustomerRepositoryFactory,
	) {}

	async execute(input: CreateCustomerInput): Promise<Customer> {
		const customer = new Customer(
			Uuid.generate(),
			Name.create(input.name),
			input.email ? Email.create(input.email) : null,
			input.phone ? Phone.create(input.phone) : null,
			input.cpf ? Cpf.create(input.cpf) : null,
		);

		const repository = this.customerRepositoryFactory.create();

		if (customer.email) {
			const byEmail = await repository.findByEmail(customer.email.value);
			if (byEmail) {
				throw new CustomerEmailAlreadyExistsError(customer.email.value);
			}
		}
		if (customer.cpf) {
			const byCpf = await repository.findByCpf(customer.cpf.value);
			if (byCpf) {
				throw new CustomerCpfAlreadyExistsError(customer.cpf.value);
			}
		}

		return repository.create(customer);
	}
}

export { CreateCustomerUseCase };
