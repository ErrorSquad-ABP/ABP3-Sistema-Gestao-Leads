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
};
type AuditLogActorById = ReadonlyMap<string, AuditLogActorRow>;

function computeTotalPages(total: number, limit: number): number {
	if (total === 0) {
		return 0;
	}
	return Math.ceil(total / limit);
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
		const where: Prisma.AuditLogWhereInput = {
			...(query.category !== undefined && {
				entityName: AUDIT_LOG_CATEGORY_ENTITY_NAMES[query.category],
			}),
			...(query.action !== undefined && {
				action: query.action,
			}),
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
