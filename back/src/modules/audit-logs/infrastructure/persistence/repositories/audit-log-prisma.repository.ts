import type { Prisma } from '../../../../../generated/prisma/client.js';
import { parseAuditActionType } from '../../../../../shared/domain/enums/audit-action-type.enum.js';
import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import { AuditLog } from '../../../domain/entities/audit-log.entity.js';
import {
	AUDIT_LOG_CATEGORY_ENTITY_NAMES,
	type AuditLogListPage,
	type AuditLogListQuery,
	type IAuditLogRepository,
} from '../../../domain/repositories/audit-log.repository.js';

type AuditLogRow = Prisma.AuditLogGetPayload<{}>;
type AuditLogActorRow = {
	readonly id: string;
	readonly name: string;
	readonly email: string;
	readonly role: string;
};
type AuditLogActorById = ReadonlyMap<string, AuditLogActorRow>;

function computeTotalPages(total: number, limit: number): number {
	if (total === 0) {
		return 0;
	}
	return Math.ceil(total / limit);
}

function isUuid(value: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
		value,
	);
}

function actorSearchWhere(user: string): Prisma.AuditLogWhereInput | undefined {
	const search = user.trim();
	if (search.length === 0) {
		return undefined;
	}
	const conditions: Prisma.AuditLogWhereInput[] = [
		{
			actorUser: {
				is: {
					name: { contains: search, mode: 'insensitive' },
				},
			},
		},
		{
			actorUser: {
				is: {
					email: { contains: search, mode: 'insensitive' },
				},
			},
		},
	];
	if (isUuid(search)) {
		conditions.push({ actorUserId: search });
	}
	return { OR: conditions };
}

function toDomain(row: AuditLogRow, actorById: AuditLogActorById): AuditLog {
	const actor = row.actorUserId
		? (actorById.get(row.actorUserId) ?? null)
		: null;
	return new AuditLog(
		Uuid.parse(row.id),
		row.actorUserId === null ? null : Uuid.parse(row.actorUserId),
		parseAuditActionType(row.action),
		row.entityName,
		row.entityId,
		row.metadata,
		row.createdAt,
		actor
			? {
					id: Uuid.parse(actor.id),
					name: actor.name,
					email: actor.email,
					role: actor.role,
				}
			: null,
	);
}

class AuditLogPrismaRepository implements IAuditLogRepository {
	constructor(private readonly prisma: PrismaService) {}

	private async actorMapFor(
		rows: readonly AuditLogRow[],
	): Promise<AuditLogActorById> {
		const actorUserIds = [
			...new Set(
				rows
					.map((row) => row.actorUserId)
					.filter((id): id is string => typeof id === 'string'),
			),
		];
		if (actorUserIds.length === 0) {
			return new Map();
		}
		const actors = await this.prisma.user.findMany({
			where: { id: { in: actorUserIds } },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
			},
		});
		return new Map(actors.map((actor) => [actor.id, actor]));
	}

	async create(log: AuditLog): Promise<AuditLog> {
		const created = await this.prisma.auditLog.create({
			data: {
				id: log.id.value,
				actorUserId: log.actorUserId?.value ?? null,
				action: log.actionType,
				entityName: log.entityName,
				entityId: log.entityId,
				metadata: log.metadata as Prisma.InputJsonValue,
				createdAt: log.createdAt,
			},
		});
		const actorById = await this.actorMapFor([created]);
		return toDomain(created, actorById);
	}

	async list(): Promise<AuditLog[]> {
		const rows = await this.prisma.auditLog.findMany({
			orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
		});
		const actorById = await this.actorMapFor(rows);
		return rows.map((row) => toDomain(row, actorById));
	}

	async listPaged(query: AuditLogListQuery): Promise<AuditLogListPage> {
		const actorWhere =
			query.user === undefined ? undefined : actorSearchWhere(query.user);
		const where: Prisma.AuditLogWhereInput = {
			...(query.category !== undefined && {
				entityName: AUDIT_LOG_CATEGORY_ENTITY_NAMES[query.category],
			}),
			...(query.action !== undefined && {
				action: query.action,
			}),
			...(query.startDate !== undefined || query.endDate !== undefined
				? {
						createdAt: {
							...(query.startDate !== undefined && { gte: query.startDate }),
							...(query.endDate !== undefined && { lte: query.endDate }),
						},
					}
				: {}),
			...(actorWhere !== undefined ? actorWhere : {}),
		};
		const skip = (query.page - 1) * query.limit;
		const [items, total] = await Promise.all([
			this.prisma.auditLog.findMany({
				where,
				skip,
				take: query.limit,
				orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
			}),
			this.prisma.auditLog.count({ where }),
		]);
		const actorById = await this.actorMapFor(items);
		return {
			items: items.map((row) => toDomain(row, actorById)),
			page: query.page,
			limit: query.limit,
			total,
			totalPages: computeTotalPages(total, query.limit),
		};
	}
}

export { AuditLogPrismaRepository };
