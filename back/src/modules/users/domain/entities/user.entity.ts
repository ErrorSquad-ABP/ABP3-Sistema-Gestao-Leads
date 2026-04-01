import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import type {
	TeamId,
	UUID,
} from '../../../../shared/domain/types/identifiers.js';
import type { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import type { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import type { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';

/**
 * User aggregate root (operational context: users).
 */
class User extends AggregateRoot {
	readonly id: UUID;
	readonly name: Name;
	readonly email: Email;
	readonly passwordHash: PasswordHash;
	readonly role: UserRole;
	readonly teamId: TeamId | null;

	constructor(
		id: UUID,
		name: Name,
		email: Email,
		passwordHash: PasswordHash,
		role: UserRole,
		teamId: TeamId | null,
	) {
		super();
		this.id = id;
		this.name = name;
		this.email = email;
		this.passwordHash = passwordHash;
		this.role = role;
		this.teamId = teamId;
	}
}

export { User };
