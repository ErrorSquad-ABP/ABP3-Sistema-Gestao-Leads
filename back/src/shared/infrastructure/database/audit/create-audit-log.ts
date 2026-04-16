import { randomUUID } from 'node:crypto';

import type { Prisma } from '../../../../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

async function createAuditLogEntry(
	client: PrismaClientLike,
	input: {
		readonly actorUserId: string | null;
		readonly action: string;
		readonly entityName: string;
		readonly entityId: string | null;
		readonly metadata?: Prisma.InputJsonValue;
	},
): Promise<void> {
	await client.auditLog.create({
		data: {
			id: randomUUID(),
			actorUserId: input.actorUserId,
			action: input.action,
			entityName: input.entityName,
			entityId: input.entityId,
			metadata: input.metadata,
		},
	});
}

export { createAuditLogEntry };
export type { PrismaClientLike };
