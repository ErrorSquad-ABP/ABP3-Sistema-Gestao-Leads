import { Uuid } from '../../../shared/domain/types/identifiers.js';
import type { Argon2PasswordHasherService } from '../../../shared/infrastructure/security/argon2-password-hasher.service.js';
import type { User } from '../../users/domain/entities/user.entity.js';
import { UserNotFoundError } from '../../users/domain/errors/user-not-found.error.js';
import type { IUserRepository } from '../../users/domain/repositories/user.repository.js';
import { InvalidCredentialsError } from '../domain/errors/invalid-credentials.error.js';

async function loadUserAndVerifyCurrentPassword(
	users: IUserRepository,
	actorUserId: string,
	currentPassword: string,
	passwordHasher: Argon2PasswordHasherService,
): Promise<User> {
	const idVo = Uuid.parse(actorUserId);
	const existing = await users.findById(idVo);
	if (existing === null) {
		throw new UserNotFoundError(actorUserId);
	}
	const passwordOk = await passwordHasher.verify(
		currentPassword,
		existing.passwordHash.value,
	);
	if (!passwordOk) {
		throw new InvalidCredentialsError();
	}
	return existing;
}

export { loadUserAndVerifyCurrentPassword };
