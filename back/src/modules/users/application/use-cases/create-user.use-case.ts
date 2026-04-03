import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
// biome-ignore lint/style/useImportType: Nest DI — metadata de parâmetro no runtime
import { Argon2PasswordHasherService } from '../../../../shared/infrastructure/security/argon2-password-hasher.service.js';
import { UserEmailAlreadyExistsError } from '../../domain/errors/user-email-already-exists.error.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UserFactory } from '../../domain/factories/user.factory.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UserRepositoryFactory } from '../../infrastructure/persistence/factories/user-repository.factory.js';
import type { CreateUserDto } from '../dto/create-user.dto.js';

@Injectable()
class CreateUserUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly userFactory: UserFactory,
		private readonly userRepositoryFactory: UserRepositoryFactory,
		private readonly passwordHasher: Argon2PasswordHasherService,
	) {}

	async execute(dto: CreateUserDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const users = this.userRepositoryFactory.create(transactionContext);

			const existing = await users.findByEmail(dto.email);
			if (existing) {
				throw new UserEmailAlreadyExistsError(dto.email);
			}

			const passwordHash = await this.passwordHasher.hash(dto.password);
			const user = this.userFactory.create({
				name: dto.name,
				email: dto.email,
				passwordHash,
				role: dto.role,
				teamId: dto.teamId,
			});

			return users.create(user);
		});
	}
}

export { CreateUserUseCase };
