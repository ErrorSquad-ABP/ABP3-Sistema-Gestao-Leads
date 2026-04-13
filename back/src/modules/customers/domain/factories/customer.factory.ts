import { Cpf } from '../../../../shared/domain/value-objects/cpf.value-object.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { Phone } from '../../../../shared/domain/value-objects/phone.value-object.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
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
			params.email ? Email.create(params.email) : null,
			params.phone ? Phone.create(params.phone) : null,
			params.cpf ? Cpf.create(params.cpf) : null,
		);
	}

	update(existing: Customer, params: UpdateCustomerParams): Customer {
		return new Customer(
			existing.id,
			params.name !== undefined ? Name.create(params.name) : existing.name,
			params.email !== undefined
				? params.email
					? Email.create(params.email)
					: null
				: existing.email,
			params.phone !== undefined
				? params.phone
					? Phone.create(params.phone)
					: null
				: existing.phone,
			params.cpf !== undefined
				? params.cpf
					? Cpf.create(params.cpf)
					: null
				: existing.cpf,
		);
	}
}

export type { CreateCustomerParams, UpdateCustomerParams };
export { CustomerFactory };
