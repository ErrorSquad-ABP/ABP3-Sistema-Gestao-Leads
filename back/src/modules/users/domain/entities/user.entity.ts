import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import type {
	TeamId,
	UUID,
} from '../../../../shared/domain/types/identifiers.js';
import type { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import type { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import type { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';

type UserAccessGroupSummary = {
	readonly id: UUID;
	readonly name: string;
	readonly description: string;
	readonly baseRole: UserRole | null;
	readonly featureKeys: readonly string[];
	readonly isSystemGroup: boolean;
};

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
	readonly accessGroupId: UUID | null;
	readonly accessGroup: UserAccessGroupSummary | null;

	constructor(
		id: UUID,
		name: Name,
		email: Email,
		passwordHash: PasswordHash,
		role: UserRole,
		teamId: TeamId | null,
		accessGroupId: UUID | null,
		accessGroup: UserAccessGroupSummary | null,
	) {
		super();
		this.id = id;
		this.name = name;
		this.email = email;
		this.passwordHash = passwordHash;
		this.role = role;
		this.teamId = teamId;
		this.accessGroupId = accessGroupId;
		this.accessGroup = accessGroup;
	}

	/** Compara estado persistível (evita `update` no banco quando não há mudança real). */
	static sameState(a: User, b: User): boolean {
		if (!a.id.equals(b.id)) {
			return false;
		}
		if (!a.name.equals(b.name) || !a.email.equals(b.email)) {
			return false;
		}
		if (!a.passwordHash.equals(b.passwordHash) || a.role !== b.role) {
			return false;
		}
		if (a.teamId === null && b.teamId === null) {
			if (a.accessGroupId === null && b.accessGroupId === null) {
				return true;
			}
			if (a.accessGroupId === null || b.accessGroupId === null) {
				return false;
			}
			return a.accessGroupId.equals(b.accessGroupId);
		}
		if (a.teamId === null || b.teamId === null) {
			return false;
		}
		if (!a.teamId.equals(b.teamId)) {
			return false;
		}
		if (a.accessGroupId === null && b.accessGroupId === null) {
			return true;
		}
		if (a.accessGroupId === null || b.accessGroupId === null) {
			return false;
		}
		return a.accessGroupId.equals(b.accessGroupId);
	}
}

export type { UserAccessGroupSummary };
export { User };
