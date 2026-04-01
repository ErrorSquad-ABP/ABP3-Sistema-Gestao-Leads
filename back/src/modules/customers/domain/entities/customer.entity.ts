import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type { UUID } from '../../../../shared/domain/types/identifiers.js';
import type { Cpf } from '../../../../shared/domain/value-objects/cpf.value-object.js';
import type { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import type { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import type { Phone } from '../../../../shared/domain/value-objects/phone.value-object.js';

/**
 * Customer aggregate root (operational context: customers).
 */
class Customer extends AggregateRoot {
	readonly id: UUID;
	readonly name: Name;
	readonly email: Email | null;
	readonly phone: Phone | null;
	readonly cpf: Cpf | null;

	constructor(
		id: UUID,
		name: Name,
		email: Email | null,
		phone: Phone | null,
		cpf: Cpf | null,
	) {
		super();
		this.id = id;
		this.name = name;
		this.email = email;
		this.phone = phone;
		this.cpf = cpf;
	}
}

export { Customer };
