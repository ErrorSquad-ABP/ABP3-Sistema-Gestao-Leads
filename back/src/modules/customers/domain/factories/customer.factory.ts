import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Cpf } from '../../../../shared/domain/value-objects/cpf.value-object.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { Phone } from '../../../../shared/domain/value-objects/phone.value-object.js';
import { Customer } from '../entities/customer.entity.js';

type CreateCustomerParams = {
	readonly name: string;
	readonly email?: string | null;
	readonly phone?: string | null;
	readonly cpf?: string | null;
};

type UpdateCustomerParams = {
	readonly name?: string;
	readonly email?: string | null;
	readonly phone?: string | null;
	readonly cpf?: string | null;
};

class CustomerFactory {
	create(params: CreateCustomerParams): Customer {
		return new Customer(
			Uuid.generate(),
			Name.create(params.name),
			params.email === undefined || params.email === null
				? null
				: Email.create(params.email),
			params.phone === undefined || params.phone === null
				? null
				: Phone.create(params.phone),
			params.cpf === undefined || params.cpf === null
				? null
				: Cpf.create(params.cpf),
		);
	}

	update(existing: Customer, params: UpdateCustomerParams): Customer {
		return new Customer(
			existing.id,
			params.name !== undefined ? Name.create(params.name) : existing.name,
			params.email !== undefined
				? params.email === null
					? null
					: Email.create(params.email)
				: existing.email,
			params.phone !== undefined
				? params.phone === null
					? null
					: Phone.create(params.phone)
				: existing.phone,
			params.cpf !== undefined
				? params.cpf === null
					? null
					: Cpf.create(params.cpf)
				: existing.cpf,
		);
	}
}

export type { CreateCustomerParams, UpdateCustomerParams };
export { CustomerFactory };
