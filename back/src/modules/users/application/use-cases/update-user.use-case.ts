import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { DomainValidationError } from '../../../../shared/domain/errors/domain-validation.error.js';
import { parseUserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
// biome-ignore lint/style/useImportType: Nest DI — metadata de parâmetro no runtime
import { Argon2PasswordHasherService } from '../../../../shared/infrastructure/security/argon2-password-hasher.service.js';
import { UserEmailAlreadyExistsError } from '../../domain/errors/user-email-already-exists.error.js';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UserRepositoryFactory } from '../../infrastructure/persistence/factories/user-repository.factory.js';
import type { UpdateUserDto } from '../dto/update-user.dto.js';

function hasUserUpdatePayload(dto: UpdateUserDto): boolean {
	return (
		dto.name !== undefined ||
		dto.email !== undefined ||
		dto.password !== undefined ||
		dto.role !== undefined
	);
}

@Injectable()
class UpdateUserUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly userRepositoryFactory: UserRepositoryFactory,
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

			const idVo = Uuid.parse(userId);
			const existing = await users.findById(idVo);
			if (!existing) {
				throw new UserNotFoundError(userId);
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

			let shouldPersist = false;

			if (dto.name !== undefined) {
				const next = Name.create(dto.name);
				if (!next.equals(existing.name)) {
					existing.changeName(next);
					shouldPersist = true;
				}
			}
			if (dto.email !== undefined) {
				const next = Email.create(dto.email);
				if (!next.equals(existing.email)) {
					existing.changeEmail(next);
					shouldPersist = true;
				}
			}
			if (dto.password !== undefined) {
				const hashed = await this.passwordHasher.hash(dto.password);
				const next = PasswordHash.create(hashed);
				if (!next.equals(existing.passwordHash)) {
					existing.changePasswordHash(next);
					shouldPersist = true;
				}
			}
			if (dto.role !== undefined) {
				const next = parseUserRole(dto.role);
				if (next !== existing.role) {
					existing.changeRole(next);
					shouldPersist = true;
				}
			}

			if (!shouldPersist) {
				return existing;
			}

			return users.update(existing);
		});
	}
}

export { UpdateUserUseCase };
