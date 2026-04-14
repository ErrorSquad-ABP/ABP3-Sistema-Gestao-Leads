import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { DomainValidationError } from '../../../../shared/domain/errors/domain-validation.error.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
// biome-ignore lint/style/useImportType: Nest DI — metadata de parâmetro no runtime
import { Argon2PasswordHasherService } from '../../../../shared/infrastructure/security/argon2-password-hasher.service.js';
// biome-ignore lint/style/useImportType: Nest DI
import { TeamRepositoryFactory } from '../../../teams/infrastructure/persistence/factories/team-repository.factory.js';
import { User } from '../../domain/entities/user.entity.js';
import { UserEmailAlreadyExistsError } from '../../domain/errors/user-email-already-exists.error.js';
import { UserInvalidTeamError } from '../../domain/errors/user-invalid-team.error.js';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UserFactory } from '../../domain/factories/user.factory.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UserRepositoryFactory } from '../../infrastructure/persistence/factories/user-repository.factory.js';
import type { UpdateUserDto } from '../dto/update-user.dto.js';

function hasUserUpdatePayload(dto: UpdateUserDto): boolean {
	return (
		dto.accessGroupId !== undefined ||
		dto.name !== undefined ||
		dto.email !== undefined ||
		dto.password !== undefined ||
		dto.role !== undefined ||
		dto.teamId !== undefined
	);
}

@Injectable()
class UpdateUserUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly userFactory: UserFactory,
		private readonly userRepositoryFactory: UserRepositoryFactory,
		private readonly teamRepositoryFactory: TeamRepositoryFactory,
		private readonly passwordHasher: Argon2PasswordHasherService,
	) {}

	async execute(userId: string, dto: UpdateUserDto) {
		if (!hasUserUpdatePayload(dto)) {
			throw new DomainValidationError(
				'Informe ao menos um campo para atualizar o usuário.',
				{ code: 'user.update.no_fields' },
			);
		}

		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const users = this.userRepositoryFactory.create(transactionContext);
			const teams = this.teamRepositoryFactory.create(transactionContext);

			const idVo = Uuid.parse(userId);
			const existing = await users.findById(idVo);
			if (!existing) {
				throw new UserNotFoundError(userId);
			}

			if (dto.teamId !== undefined && dto.teamId !== null) {
				const team = await teams.findById(Uuid.parse(dto.teamId));
				if (!team) {
					throw new UserInvalidTeamError(dto.teamId);
				}
			}

			if (dto.email !== undefined) {
				const nextEmail = Email.create(dto.email);
				if (!nextEmail.equals(existing.email)) {
					const other = await users.findByEmail(nextEmail.value);
					if (other && !other.id.equals(existing.id)) {
						throw new UserEmailAlreadyExistsError(nextEmail.value);
					}
				}
			}

			let passwordHash: PasswordHash | undefined;
			if (dto.password !== undefined) {
				const hashed = await this.passwordHasher.hash(dto.password);
				passwordHash = PasswordHash.create(hashed);
			}

			const updated = this.userFactory.update(existing, {
				accessGroupId: dto.accessGroupId,
				name: dto.name,
				email: dto.email,
				passwordHash,
				role: dto.role,
				teamId: dto.teamId,
			});

			if (User.sameState(existing, updated)) {
				return existing;
			}

			return users.update(updated);
		});
	}
}

export { UpdateUserUseCase };
