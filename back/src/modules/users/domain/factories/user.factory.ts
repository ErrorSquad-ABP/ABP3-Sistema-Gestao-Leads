import { parseUserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
import { User } from '../entities/user.entity.js';

type CreateUserParams = {
	readonly name: string;
	readonly email: string;
	readonly passwordHash: string;
	readonly role: string;
	readonly accessGroupId: string | null;
};

type UpdateUserParams = {
	readonly name?: string;
	readonly email?: string;
	readonly passwordHash?: PasswordHash;
	readonly role?: string;
	readonly accessGroupId?: string | null;
};

class UserFactory {
	create(params: CreateUserParams): User {
		return new User(
			Uuid.generate(),
			Name.create(params.name),
			Email.create(params.email),
			PasswordHash.create(params.passwordHash),
			parseUserRole(params.role),
			[],
			[],
			params.accessGroupId === null ? null : Uuid.parse(params.accessGroupId),
			null,
		);
	}

	update(existing: User, params: UpdateUserParams): User {
		const nextAccessGroupId =
			params.accessGroupId !== undefined
				? params.accessGroupId === null
					? null
					: Uuid.parse(params.accessGroupId)
				: existing.accessGroupId;
		const nextAccessGroup =
			params.accessGroupId === undefined
				? existing.accessGroup
				: nextAccessGroupId !== null &&
					  existing.accessGroup !== null &&
					  existing.accessGroup.id.equals(nextAccessGroupId)
					? existing.accessGroup
					: null;

		return new User(
			existing.id,
			params.name !== undefined ? Name.create(params.name) : existing.name,
			params.email !== undefined ? Email.create(params.email) : existing.email,
			params.passwordHash ?? existing.passwordHash,
			params.role !== undefined ? parseUserRole(params.role) : existing.role,
			existing.memberTeamIds,
			existing.managedTeamIds,
			nextAccessGroupId,
			nextAccessGroup,
		);
	}
}

export type { CreateUserParams, UpdateUserParams };
export { UserFactory };
