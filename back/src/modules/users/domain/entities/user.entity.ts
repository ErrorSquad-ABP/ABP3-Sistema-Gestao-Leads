import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import type {
	TeamId,
	UUID,
} from '../../../../shared/domain/types/identifiers.js';
import type { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import type { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import type { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';

function sortedUuidValues(ids: readonly UUID[]): string[] {
	return [...ids].map((id) => id.value).sort();
}

function sameUuidIdSets(a: readonly UUID[], b: readonly UUID[]): boolean {
	const as = sortedUuidValues(a);
	const bs = sortedUuidValues(b);
	if (as.length !== bs.length) {
		return false;
	}
	return as.join('\u0000') === bs.join('\u0000');
}

type UserAccessGroupSummary = {
	readonly id: UUID;
	readonly name: string;
	readonly description: string;
	readonly baseRole: UserRole | null;
	readonly featureKeys: readonly string[];
	readonly isSystemGroup: boolean;
};

/**
 * ADR-001: o conjunto efetivo de features é a união explícita dos grupos
 * vinculados — sem herança entre grupos e sem features implícitas por papel.
 */
function unionFeatureKeys(
	groups: readonly UserAccessGroupSummary[],
): readonly string[] {
	const union = new Set<string>();
	for (const group of groups) {
		for (const featureKey of group.featureKeys) {
			union.add(featureKey);
		}
	}
	return [...union].sort();
}

class User extends AggregateRoot {
	private _id: UUID;
	private _name: Name;
	private _email: Email;
	private _passwordHash: PasswordHash;
	private _role: UserRole;
	private _memberTeamIds: TeamId[];
	private _managedTeamIds: TeamId[];
	private _accessGroupIds: UUID[];
	private _accessGroups: UserAccessGroupSummary[];

	constructor(
		id: UUID,
		name: Name,
		email: Email,
		passwordHash: PasswordHash,
		role: UserRole,
		memberTeamIds: readonly TeamId[],
		managedTeamIds: readonly TeamId[],
		accessGroupIds: readonly UUID[] = [],
		accessGroups: readonly UserAccessGroupSummary[] = [],
	) {
		super();
		this._id = id;
		this._name = name;
		this._email = email;
		this._passwordHash = passwordHash;
		this._role = role;
		this._memberTeamIds = [...memberTeamIds];
		this._managedTeamIds = [...managedTeamIds];
		this._accessGroupIds = [...accessGroupIds];
		this._accessGroups = [...accessGroups];
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

	get accessGroupIds(): readonly UUID[] {
		return this._accessGroupIds;
	}

	get accessGroups(): readonly UserAccessGroupSummary[] {
		return this._accessGroups;
	}

	get featureKeys(): readonly string[] {
		return unionFeatureKeys(this._accessGroups);
	}

	get memberTeamIds(): readonly TeamId[] {
		return this._memberTeamIds;
	}

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

	changeAccessGroups(
		accessGroupIds: readonly UUID[],
		accessGroups: readonly UserAccessGroupSummary[],
	): void {
		this._accessGroupIds = [...accessGroupIds];
		this._accessGroups = [...accessGroups];
	}

	hasSameAccessGroups(accessGroupIds: readonly UUID[]): boolean {
		return sameUuidIdSets(this._accessGroupIds, accessGroupIds);
	}

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
			sameUuidIdSets(a._accessGroupIds, b._accessGroupIds) &&
			sameUuidIdSets(a._memberTeamIds, b._memberTeamIds) &&
			sameUuidIdSets(a._managedTeamIds, b._managedTeamIds)
		);
	}
}

export type { UserAccessGroupSummary };
export { User };
