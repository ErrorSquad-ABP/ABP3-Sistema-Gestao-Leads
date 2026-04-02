import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { UserRole as PrismaUserRole } from '../../../../../generated/prisma/enums.js';
import { parseUserRole } from '../../../../../shared/domain/enums/user-role.enum.js';
import { Name } from '../../../../../shared/domain/value-objects/name.value-object.js';
import { Email } from '../../../../../shared/domain/value-objects/email.value-object.js';
import { PasswordHash } from '../../../../../shared/domain/value-objects/password-hash.value-object.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import { User } from '../../../domain/entities/user.entity.js';
import type { IUserRepository } from '../../../domain/repositories/user.repository.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;
type UserRecord = {
	readonly id: string;
	readonly name: string;
	readonly email: string;
	readonly password: string;
	readonly role: PrismaUserRole;
	readonly teamId: string | null;
};

const USER_ROLE_TO_PRISMA: Record<string, PrismaUserRole> = {
	ADMINISTRATOR: 'ADMIN',
	ATTENDANT: 'ATTENDANT',
	GENERAL_MANAGER: 'GENERAL_MANAGER',
	MANAGER: 'MANAGER',
};

const PRISMA_ROLE_TO_USER: Record<PrismaUserRole, string> = {
	ADMIN: 'ADMINISTRATOR',
	ATTENDANT: 'ATTENDANT',
	GENERAL_MANAGER: 'GENERAL_MANAGER',
	MANAGER: 'MANAGER',
};

class UserPrismaRepository implements IUserRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	async create(user: User): Promise<User> {
		const created = await this.client.user.create({
			data: {
				email: user.email.value,
				name: user.name.value,
				password: user.passwordHash.value,
				role: USER_ROLE_TO_PRISMA[user.role] ?? 'ATTENDANT',
				teamId: user.teamId,
			},
		});
		return this.toDomain(created);
	}

	async update(user: User): Promise<User> {
		const updated = await this.client.user.update({
			data: {
				email: user.email.value,
				name: user.name.value,
				password: user.passwordHash.value,
				role: USER_ROLE_TO_PRISMA[user.role] ?? 'ATTENDANT',
				teamId: user.teamId,
			},
			where: { id: user.id },
		});
		return this.toDomain(updated);
	}

	async delete(id: string): Promise<void> {
		await this.client.user.delete({ where: { id } });
	}

	async findById(id: string): Promise<User | null> {
		const user = await this.client.user.findUnique({ where: { id } });
		return user ? this.toDomain(user) : null;
	}

	async findByEmail(email: string): Promise<User | null> {
		const user = await this.client.user.findUnique({ where: { email } });
		return user ? this.toDomain(user) : null;
	}

	async list(): Promise<User[]> {
		const users = await this.client.user.findMany({
			orderBy: { createdAt: 'desc' },
		});
		return users.map((user) => this.toDomain(user));
	}

	private toDomain(record: UserRecord): User {
		return new User(
			record.id,
			Name.create(record.name),
			Email.create(record.email),
			PasswordHash.create(record.password),
			parseUserRole(PRISMA_ROLE_TO_USER[record.role]),
			record.teamId,
		);
	}

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}
}

export { UserPrismaRepository };
