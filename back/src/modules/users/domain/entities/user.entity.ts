import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import type {
	TeamId,
	UUID,
} from '../../../../shared/domain/types/identifiers.js';
import type { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import type { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import type { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';

function sortedUuidValues(ids: readonly TeamId[]): string[] {
	return [...ids].map((id) => id.value).sort();
}

function sameUuidIdSets(a: readonly TeamId[], b: readonly TeamId[]): boolean {
	const as = sortedUuidValues(a);
	const bs = sortedUuidValues(b);
	if (as.length !== bs.length) {
		return false;
	}
	/** Comparação lexicográfica estável sem indexação dinâmica (evita falso positivo do ESLint security). */
	return as.join('\u0000') === bs.join('\u0000');
}

/**
 * User aggregate root (operational context: users).
 * Vínculos com equipes vêm das relações `memberTeams` e `managedTeams` no banco;
 * os ids são carregados no agregado apenas para projeção / consistência de leitura.
 */
class User extends AggregateRoot {
	private _id: UUID;
	private _name: Name;
	private _email: Email;
	private _passwordHash: PasswordHash;
	private _role: UserRole;
	private _memberTeamIds: TeamId[];
	private _managedTeamIds: TeamId[];

	constructor(
		id: UUID,
		name: Name,
		email: Email,
		passwordHash: PasswordHash,
		role: UserRole,
		memberTeamIds: readonly TeamId[],
		managedTeamIds: readonly TeamId[],
	) {
		super();
		this._id = id;
		this._name = name;
		this._email = email;
		this._passwordHash = passwordHash;
		this._role = role;
		this._memberTeamIds = [...memberTeamIds];
		this._managedTeamIds = [...managedTeamIds];
	}

	get id(): UUID {
		return this._id;
	}

	get name(): Name {
		return this._name;
	}

	get email(): Email {
		return this._email;
	}

	get passwordHash(): PasswordHash {
		return this._passwordHash;
	}

	get role(): UserRole {
		return this._role;
	}

	/** Equipes das quais o usuário é membro (relação TeamMembers). */
	get memberTeamIds(): readonly TeamId[] {
		return this._memberTeamIds;
	}

	/** Equipes que o usuário gerencia (relação TeamManager). */
	get managedTeamIds(): readonly TeamId[] {
		return this._managedTeamIds;
	}

	changeName(name: Name): void {
		if (this._name.equals(name)) {
			return;
		}
		this._name = name;
	}

	changeEmail(email: Email): void {
		if (this._email.equals(email)) {
			return;
		}
		this._email = email;
	}

	changePasswordHash(passwordHash: PasswordHash): void {
		if (this._passwordHash.equals(passwordHash)) {
			return;
		}
		this._passwordHash = passwordHash;
	}

	changeRole(role: UserRole): void {
		if (this._role === role) {
			return;
		}
		this._role = role;
	}

	/** Compara estado persistível (evita `update` no banco quando não há mudança real). */
	static sameState(a: User, b: User): boolean {
		if (!a._id.equals(b._id)) {
			return false;
		}
		if (!a._name.equals(b._name) || !a._email.equals(b._email)) {
			return false;
		}
		if (!a._passwordHash.equals(b._passwordHash) || a._role !== b._role) {
			return false;
		}
		return (
			sameUuidIdSets(a._memberTeamIds, b._memberTeamIds) &&
			sameUuidIdSets(a._managedTeamIds, b._managedTeamIds)
		);
	}
}

export { User };
