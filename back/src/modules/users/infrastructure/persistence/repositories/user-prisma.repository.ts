import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { UserRole as PrismaUserRole } from '../../../../../generated/prisma/enums.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import { parseUserRole } from '../../../../../shared/domain/enums/user-role.enum.js';
import type { UUID } from '../../../../../shared/domain/types/identifiers.js';
import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../../shared/domain/value-objects/name.value-object.js';
import { PasswordHash } from '../../../../../shared/domain/value-objects/password-hash.value-object.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import { User } from '../../../domain/entities/user.entity.js';
import { UserEmailAlreadyExistsError } from '../../../domain/errors/user-email-already-exists.error.js';
import { UserInvalidAccessGroupError } from '../../../domain/errors/user-invalid-access-group.error.js';
import type { IUserRepository } from '../../../domain/repositories/user.repository.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

type UserRecord = {
	readonly id: string;
	readonly name: string;
	readonly email: string;
	readonly password: string;
	readonly role: PrismaUserRole;
	readonly memberTeams: readonly { readonly id: string }[];
	readonly managedTeams: readonly { readonly id: string }[];
	readonly accessGroupId: string | null;
	readonly accessGroup?: {
		readonly id: string;
		readonly name: string;
		readonly description: string;
		readonly baseRole: PrismaUserRole | null;
		readonly featureKeys: Prisma.JsonValue;
		readonly isSystemGroup: boolean;
	} | null;
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

const userRelationsInclude = {
	memberTeams: { select: { id: true } },
	managedTeams: { select: { id: true } },
	accessGroup: true,
} as const;

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

function isTransientPrismaError(error: unknown): boolean {
	return (
		isPrismaKnownRequest(error) &&
		['ETIMEDOUT', 'ECONNRESET', 'P1001'].includes(error.code)
	);
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

class UserPrismaRepository implements IUserRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	private async withTransientRetry<T>(operation: () => Promise<T>): Promise<T> {
		const maxAttempts = 3;

		for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
			try {
				return await operation();
			} catch (error) {
				if (!isTransientPrismaError(error) || attempt === maxAttempts) {
					throw error;
				}

				await delay(250 * attempt);
			}
		}

		throw new Error('Unreachable retry branch in UserPrismaRepository.');
	}

	async create(user: User): Promise<User> {
		try {
			const created = await this.client.user.create({
				data: {
					accessGroupId: user.accessGroupId?.value ?? null,
					email: user.email.value,
					name: user.name.value,
					password: user.passwordHash.value,
					role: USER_ROLE_TO_PRISMA[user.role] ?? 'ATTENDANT',
				},
				include: userRelationsInclude,
			});
			return this.toDomain(created);
		} catch (error: unknown) {
			this.rethrowPrismaUserErrors(
				error,
				user.email.value,
				user.accessGroupId?.value,
			);
			throw error;
		}
	}

	async update(user: User): Promise<User> {
		try {
			const updated = await this.client.user.update({
				data: {
					accessGroupId: user.accessGroupId?.value ?? null,
					email: user.email.value,
					name: user.name.value,
					password: user.passwordHash.value,
					role: USER_ROLE_TO_PRISMA[user.role] ?? 'ATTENDANT',
				},
				where: { id: user.id.value },
				include: userRelationsInclude,
			});
			return this.toDomain(updated);
		} catch (error: unknown) {
			this.rethrowPrismaUserErrors(
				error,
				user.email.value,
				user.accessGroupId?.value,
			);
			throw error;
		}
	}

	async delete(id: Parameters<IUserRepository['delete']>[0]): Promise<void> {
		await this.client.user.delete({ where: { id: id.value } });
	}

	async findById(
		id: Parameters<IUserRepository['findById']>[0],
	): Promise<User | null> {
		const user = await this.withTransientRetry(() =>
			this.client.user.findUnique({
				where: { id: id.value },
				include: userRelationsInclude,
			}),
		);
		return user ? this.toDomain(user) : null;
	}

	async findByEmail(email: string): Promise<User | null> {
		const normalized = Email.create(email).value;
		const user = await this.withTransientRetry(() =>
			this.client.user.findUnique({
				where: { email: normalized },
				include: userRelationsInclude,
			}),
		);
		return user ? this.toDomain(user) : null;
	}

	async listByIds(ids: readonly UUID[]): Promise<readonly User[]> {
		if (ids.length === 0) {
			return [];
		}

		const rows = await this.client.user.findMany({
			where: { id: { in: ids.map((id) => id.value) } },
			orderBy: { name: 'asc' },
			include: userRelationsInclude,
		});

		return rows.map((row) => this.toDomain(row));
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
				include: userRelationsInclude,
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
			record.memberTeams.map((team) => Uuid.parse(team.id)),
			record.managedTeams.map((team) => Uuid.parse(team.id)),
			record.accessGroupId === null ? null : Uuid.parse(record.accessGroupId),
			record.accessGroup === null || record.accessGroup === undefined
				? null
				: {
						id: Uuid.parse(record.accessGroup.id),
						name: record.accessGroup.name,
						description: record.accessGroup.description,
						baseRole:
							record.accessGroup.baseRole === null
								? null
								: parseUserRole(
										PRISMA_ROLE_TO_USER[record.accessGroup.baseRole],
									),
						featureKeys: Array.isArray(record.accessGroup.featureKeys)
							? record.accessGroup.featureKeys.filter(
									(value): value is string => typeof value === 'string',
								)
							: [],
						isSystemGroup: record.accessGroup.isSystemGroup,
					},
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
		accessGroupId: string | undefined,
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
			if (
				targets.some((value) => String(value).toLowerCase().includes('email'))
			) {
				throw new UserEmailAlreadyExistsError(email);
			}
		}
		if (error.code === 'P2003') {
			const fieldName =
				typeof error.meta?.target === 'string'
					? error.meta.target
					: Array.isArray(error.meta?.target)
						? error.meta.target.join(',')
						: '';
			if (
				accessGroupId !== undefined &&
				accessGroupId !== '' &&
				fieldName.toLowerCase().includes('accessgroup')
			) {
				throw new UserInvalidAccessGroupError(accessGroupId);
			}
		}
	}
}

export { UserPrismaRepository };
