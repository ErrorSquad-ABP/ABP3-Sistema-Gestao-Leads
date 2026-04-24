import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
// biome-ignore lint/style/useImportType: Nest DI
import { Argon2PasswordHasherService } from '../../../../shared/infrastructure/security/argon2-password-hasher.service.js';
import type { User } from '../../../users/domain/entities/user.entity.js';
import { UserEmailAlreadyExistsError } from '../../../users/domain/errors/user-email-already-exists.error.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest DI
import { AuthSessionPrismaRepository } from '../../infrastructure/auth-session.prisma-repository.js';
import { loadUserAndVerifyCurrentPassword } from '../load-user-and-verify-current-password.js';

@Injectable()
class UpdateOwnEmailUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly userRepositoryFactory: UserRepositoryFactory,
		private readonly passwordHasher: Argon2PasswordHasherService,
		private readonly authSessions: AuthSessionPrismaRepository,
	) {}

	async execute(
		actorUserId: string,
		dto: { readonly currentPassword: string; readonly email: string },
	): Promise<{
		readonly user: User;
		readonly refreshSessionsRevoked: boolean;
	}> {
		const { user, refreshSessionsRevoked } = await this.unitOfWork.run(
			async () => {
				const transactionContext = this.unitOfWork.getTransactionContext();
				const users = this.userRepositoryFactory.create(transactionContext);
				const existing = await loadUserAndVerifyCurrentPassword(
					users,
					actorUserId,
					dto.currentPassword,
					this.passwordHasher,
				);

				const nextEmail = Email.create(dto.email);
				if (nextEmail.equals(existing.email)) {
					return { user: existing, refreshSessionsRevoked: false };
				}

				const other = await users.findByEmail(nextEmail.value);
				if (other !== null && !other.id.equals(existing.id)) {
					throw new UserEmailAlreadyExistsError(nextEmail.value);
				}

				existing.changeEmail(nextEmail);
				const saved = await users.update(existing);
				await this.authSessions.revokeAllActiveSessionsForUser(
					actorUserId,
					transactionContext,
				);
				return { user: saved, refreshSessionsRevoked: true };
			},
		);

		return { user, refreshSessionsRevoked };
	}
}

export { UpdateOwnEmailUseCase };
