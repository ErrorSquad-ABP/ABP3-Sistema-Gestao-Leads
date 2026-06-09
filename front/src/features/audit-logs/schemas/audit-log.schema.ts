import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

import { auditLogActions } from '../model/audit-logs.model';

const auditLogActorSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string(),
	role: z.string(),
});

const auditLogSchema = z.object({
	id: z.string().uuid(),
	actorUserId: z.string().uuid().nullable(),
	actor: auditLogActorSchema.nullable(),
	action: z.enum(auditLogActions),
	entityName: z.string(),
	entityId: z.string().nullable(),
	metadata: z.unknown(),
	createdAt: z.coerce.date(),
});

const auditLogsPageSchema = z.object({
	items: z.array(auditLogSchema),
	page: z.number().int(),
	limit: z.number().int(),
	total: z.number().int(),
	totalPages: z.number().int(),
});

function parseAuditLogsPage(data: unknown) {
	const parsed = auditLogsPageSchema.safeParse(data);

	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'audit_logs.invalid_response_shape',
		});
	}

	return parsed.data;
}

export { auditLogSchema, auditLogsPageSchema, parseAuditLogsPage };
