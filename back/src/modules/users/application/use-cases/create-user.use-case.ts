import { Inject, Injectable } from '@nestjs/common';

import type { Prisma } from '../../../../generated/prisma/client.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { createAuditLogEntry } from '../../../../shared/infrastructure/database/audit/create-audit-log.js';
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

	async execute(actorUserId: string, dto: CreateUserDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const tx = transactionContext.client as Prisma.TransactionClient;
			const users = this.userRepositoryFactory.create(transactionContext);

			const email = Email.create(dto.email);
			const existing = await users.findByEmail(email.value);
			if (existing) {
				throw new UserEmailAlreadyExistsError(email.value);
			}

			const passwordHash = await this.passwordHasher.hash(dto.password);
			const user = this.userFactory.create({
				accessGroupIds: dto.accessGroupIds,
				name: dto.name,
				email: dto.email,
				passwordHash,
				role: dto.role,
			});

			const created = await users.create(user);
			await createAuditLogEntry(tx, {
				actorUserId,
				action: 'CREATE',
				entityName: 'User',
				entityId: created.id.value,
				metadata: { role: created.role },
			});

			return created;
		});
	}
}

export { CreateUserUseCase };
