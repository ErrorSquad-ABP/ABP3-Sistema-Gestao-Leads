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
}

export type { CreateCustomerParams };
export { CustomerFactory };
