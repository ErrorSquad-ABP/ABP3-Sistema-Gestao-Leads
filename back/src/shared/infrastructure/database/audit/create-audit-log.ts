import { randomUUID } from 'node:crypto';

import type { AuditAction } from '../../../../shared/domain/enums/audit-action.enum.js';
import type { Prisma } from '../../../../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

async function createAuditLogEntry(
	client: PrismaClientLike,
	input: {
		readonly action: AuditAction;
		readonly actorUserId: string | null;
		readonly affectedId: string | null;
		readonly description?: string | null;
	},
): Promise<void> {
	await client.auditLog.create({
		data: {
			id: randomUUID(),
			action: input.action,
			actorUserId: input.actorUserId,
			affectedId: input.affectedId,
			description: input.description ?? null,
		},
	});
}

export { createAuditLogEntry };
export type { PrismaClientLike };