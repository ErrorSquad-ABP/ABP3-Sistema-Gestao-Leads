import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { UserRole as PrismaUserRole } from '../../../../../generated/prisma/enums.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import { parseUserRole } from '../../../../../shared/domain/enums/user-role.enum.js';
import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../../shared/domain/value-objects/name.value-object.js';
import { PasswordHash } from '../../../../../shared/domain/value-objects/password-hash.value-object.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import { User } from '../../../domain/entities/user.entity.js';
import { UserEmailAlreadyExistsError } from '../../../domain/errors/user-email-already-exists.error.js';
import { UserInvalidTeamError } from '../../../domain/errors/user-invalid-team.error.js';
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

function isPrismaKnownRequest(
	error: unknown,
): error is { code: string; meta?: { target?: string | string[] } } {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		typeof (error as { code: unknown }).code === 'string'
	);
}

class UserPrismaRepository implements IUserRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	async create(user: User): Promise<User> {
		try {
			const created = await this.client.user.create({
				data: {
					email: user.email.value,
					name: user.name.value,
					password: user.passwordHash.value,
					role: USER_ROLE_TO_PRISMA[user.role] ?? 'ATTENDANT',
					teamId: user.teamId?.value ?? null,
				},
			});
			return this.toDomain(created);
		} catch (error: unknown) {
			this.rethrowPrismaUserErrors(error, user.email.value, user.teamId?.value);
			throw error;
		}
	}

	async update(user: User): Promise<User> {
		try {
			const updated = await this.client.user.update({
				data: {
					email: user.email.value,
					name: user.name.value,
					password: user.passwordHash.value,
					role: USER_ROLE_TO_PRISMA[user.role] ?? 'ATTENDANT',
					teamId: user.teamId?.value ?? null,
				},
				where: { id: user.id.value },
			});
			return this.toDomain(updated);
		} catch (error: unknown) {
			this.rethrowPrismaUserErrors(error, user.email.value, user.teamId?.value);
			throw error;
		}
	}

	async delete(id: Parameters<IUserRepository['delete']>[0]): Promise<void> {
		await this.client.user.delete({ where: { id: id.value } });
	}

	async findById(
		id: Parameters<IUserRepository['findById']>[0],
	): Promise<User | null> {
		const user = await this.client.user.findUnique({ where: { id: id.value } });
		return user ? this.toDomain(user) : null;
	}

	async findByEmail(email: string): Promise<User | null> {
		const normalized = Email.create(email).value;
		const user = await this.client.user.findUnique({
			where: { email: normalized },
		});
		return user ? this.toDomain(user) : null;
	}

	async listPaged(query: {
		readonly page: number;
		readonly limit: number;
	}): Promise<{ readonly users: readonly User[]; readonly total: number }> {
		const skip = (query.page - 1) * query.limit;
		const [rows, total] = await Promise.all([
			this.client.user.findMany({
				orderBy: { createdAt: 'desc' },
				skip,
				take: query.limit,
			}),
			this.client.user.count(),
		]);
		return {
			users: rows.map((row) => this.toDomain(row)),
			total,
		};
	}

	private toDomain(record: UserRecord): User {
		return new User(
			Uuid.parse(record.id),
			Name.create(record.name),
			Email.create(record.email),
			PasswordHash.create(record.password),
			parseUserRole(PRISMA_ROLE_TO_USER[record.role]),
			record.teamId === null ? null : Uuid.parse(record.teamId),
		);
	}

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}

	private rethrowPrismaUserErrors(
		error: unknown,
		email: string,
		teamId: string | undefined,
	): void {
		if (!isPrismaKnownRequest(error)) {
			return;
		}
		if (error.code === 'P2002') {
			const target = error.meta?.target;
			const targets = Array.isArray(target)
				? target
				: target !== undefined && target !== null
					? [String(target)]
					: [];
			if (targets.some((t) => String(t).toLowerCase().includes('email'))) {
				throw new UserEmailAlreadyExistsError(email);
			}
		}
		/* Última linha: corrida ou violação de FK não antecipada no caso de uso. */
		if (error.code === 'P2003' && teamId !== undefined && teamId !== '') {
			throw new UserInvalidTeamError(teamId);
		}
	}
}

export { UserPrismaRepository };
