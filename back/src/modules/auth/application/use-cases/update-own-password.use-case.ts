import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { DomainValidationError } from '../../../../shared/domain/errors/domain-validation.error.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
// biome-ignore lint/style/useImportType: Nest DI
import { Argon2PasswordHasherService } from '../../../../shared/infrastructure/security/argon2-password-hasher.service.js';
import type { User } from '../../../users/domain/entities/user.entity.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest DI
import { AuthSessionPrismaRepository } from '../../infrastructure/auth-session.prisma-repository.js';
import { loadUserAndVerifyCurrentPassword } from '../load-user-and-verify-current-password.js';

@Injectable()
class UpdateOwnPasswordUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly userRepositoryFactory: UserRepositoryFactory,
		private readonly passwordHasher: Argon2PasswordHasherService,
		private readonly authSessions: AuthSessionPrismaRepository,
	) {}

	async execute(
		actorUserId: string,
		dto: { readonly currentPassword: string; readonly newPassword: string },
	): Promise<User> {
		if (dto.newPassword === dto.currentPassword) {
			throw new DomainValidationError(
				'A nova senha deve ser diferente da senha atual.',
				{ code: 'user.password.unchanged' },
			);
		}

		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const users = this.userRepositoryFactory.create(transactionContext);
			const existing = await loadUserAndVerifyCurrentPassword(
				users,
				actorUserId,
				dto.currentPassword,
				this.passwordHasher,
			);

			const hashed = await this.passwordHasher.hash(dto.newPassword);
			const passwordHash = PasswordHash.create(hashed);
			existing.changePasswordHash(passwordHash);
			const saved = await users.update(existing);
			await this.authSessions.revokeAllActiveSessionsForUser(
				actorUserId,
				transactionContext,
			);
			return saved;
		});
	}
}

export { UpdateOwnPasswordUseCase };
