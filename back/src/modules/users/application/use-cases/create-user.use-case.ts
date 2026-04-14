import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
// biome-ignore lint/style/useImportType: Nest DI — metadata de parâmetro no runtime
import { Argon2PasswordHasherService } from '../../../../shared/infrastructure/security/argon2-password-hasher.service.js';
// biome-ignore lint/style/useImportType: Nest DI
import { TeamRepositoryFactory } from '../../../teams/infrastructure/persistence/factories/team-repository.factory.js';
import { UserEmailAlreadyExistsError } from '../../domain/errors/user-email-already-exists.error.js';
import { UserInvalidTeamError } from '../../domain/errors/user-invalid-team.error.js';
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
		private readonly teamRepositoryFactory: TeamRepositoryFactory,
		private readonly passwordHasher: Argon2PasswordHasherService,
	) {}

	async execute(dto: CreateUserDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const users = this.userRepositoryFactory.create(transactionContext);
			const teams = this.teamRepositoryFactory.create(transactionContext);

			const email = Email.create(dto.email);
			const existing = await users.findByEmail(email.value);
			if (existing) {
				throw new UserEmailAlreadyExistsError(email.value);
			}

			if (dto.teamId !== null) {
				const team = await teams.findById(Uuid.parse(dto.teamId));
				if (!team) {
					throw new UserInvalidTeamError(dto.teamId);
				}
			}

			const passwordHash = await this.passwordHasher.hash(dto.password);
			const user = this.userFactory.create({
				accessGroupId: dto.accessGroupId,
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
