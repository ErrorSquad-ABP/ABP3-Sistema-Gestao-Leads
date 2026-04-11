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

	/** Compara estado persistível (evita `update` no banco quando não há mudança real). */
	static sameState(a: Customer, b: Customer): boolean {
		if (!a.id.equals(b.id)) {
			return false;
		}
		if (!a.name.equals(b.name)) {
			return false;
		}

		// Email comparison
		if (a.email === null && b.email === null) {
			// both null - same
		} else if (a.email === null || b.email === null) {
			return false; // one null, one not - different
		} else if (!a.email.equals(b.email)) {
			return false; // both non-null but different - different
		}

		// Phone comparison
		if (a.phone === null && b.phone === null) {
			// both null - same
		} else if (a.phone === null || b.phone === null) {
			return false; // one null, one not - different
		} else if (!a.phone.equals(b.phone)) {
			return false; // both non-null but different - different
		}

		// CPF comparison
		if (a.cpf === null && b.cpf === null) {
			return true; // both null - same
		}
		if (a.cpf === null || b.cpf === null) {
			return false; // one null, one not - different
		}
		return a.cpf.equals(b.cpf); // both non-null - compare
	}
}

export { Customer };
