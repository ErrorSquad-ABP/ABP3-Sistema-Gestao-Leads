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
		);
	}
}

export type { CreateUserParams };
export { UserFactory };
