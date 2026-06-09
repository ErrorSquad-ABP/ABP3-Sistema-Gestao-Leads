import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { listAuditLogs } from '../api/audit-logs.service';
import type { ListAuditLogsFilters } from '../model/audit-logs.model';

function useAuditLogsQuery(filters: ListAuditLogsFilters) {
	return useQuery({
		queryKey: queryKeys.auditLogs.list(filters),
		queryFn: ({ signal }) => listAuditLogs(filters, signal),
	});
}

export { useAuditLogsQuery };
