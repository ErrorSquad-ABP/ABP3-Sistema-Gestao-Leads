import { Injectable } from '@nestjs/common';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Cpf } from '../../../../shared/domain/value-objects/cpf.value-object.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { Phone } from '../../../../shared/domain/value-objects/phone.value-object.js';
import { Customer } from '../../domain/entities/customer.entity.js';
import { CustomerCpfAlreadyExistsError } from '../../domain/errors/customer-cpf-already-exists.error.js';
import { CustomerEmailAlreadyExistsError } from '../../domain/errors/customer-email-already-exists.error.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';
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
			throw new CustomerNotFoundError(id);
		}

		const nextEmail =
			input.email !== undefined
				? input.email
					? Email.create(input.email)
					: null
				: customer.email;
		const nextCpf =
			input.cpf !== undefined
				? input.cpf
					? Cpf.create(input.cpf)
					: null
				: customer.cpf;

		if (nextEmail) {
			const byEmail = await repository.findByEmail(nextEmail.value);
			if (byEmail && !byEmail.id.equals(customer.id)) {
				throw new CustomerEmailAlreadyExistsError(nextEmail.value);
			}
		}
		if (nextCpf) {
			const byCpf = await repository.findByCpf(nextCpf.value);
			if (byCpf && !byCpf.id.equals(customer.id)) {
				throw new CustomerCpfAlreadyExistsError(nextCpf.value);
			}
		}

		const updated = new Customer(
			customer.id,
			input.name !== undefined ? Name.create(input.name) : customer.name,
			nextEmail,
			input.phone !== undefined
				? input.phone
					? Phone.create(input.phone)
					: null
				: customer.phone,
			nextCpf,
		);

		return repository.update(updated);
	}
}

export { UpdateCustomerUseCase };
