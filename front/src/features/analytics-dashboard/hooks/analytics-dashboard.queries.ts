'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { getAnalyticsDashboard } from '../api/analytics-dashboard.service';
import type { AnalyticsDashboardFilter } from '../types/analytics-dashboard.types';

function useAnalyticsDashboard(filter: AnalyticsDashboardFilter) {
	return useQuery({
		queryKey: [...queryKeys.analytics.dashboard, filter],
		queryFn: () => getAnalyticsDashboard(filter),
	});
}

export { useAnalyticsDashboard };
