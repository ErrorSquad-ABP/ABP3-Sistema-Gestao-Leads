import { apiFetch } from '@/lib/http/api-client';

import type { ListAuditLogsFilters } from '../model/audit-logs.model';
import { parseAuditLogsPage } from '../schemas/audit-log.schema';

function auditLogsQuery(filters: ListAuditLogsFilters) {
	const params = new URLSearchParams({
		page: String(filters.page),
		limit: String(filters.limit),
	});

	if (filters.category) {
		params.set('category', filters.category);
	}

	if (filters.action) {
		params.set('action', filters.action);
	}

	if (filters.user) {
		params.set('user', filters.user);
	}

	if (filters.startDate) {
		params.set('startDate', filters.startDate);
	}

	if (filters.endDate) {
		params.set('endDate', filters.endDate);
	}

	return params.toString();
}

async function listAuditLogs(
	filters: ListAuditLogsFilters,
	signal?: AbortSignal,
) {
	const raw = await apiFetch<unknown>(
		`/api/audit-logs?${auditLogsQuery(filters)}`,
		{
			signal,
		},
	);

	return parseAuditLogsPage(raw);
}

export { listAuditLogs };
