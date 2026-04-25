import type { z } from 'zod';

import {
	analyticDashboardFilterModeValues,
	analyticDashboardSchema,
} from '../schemas/analytic-dashboard.schema';

type AnalyticDashboard = z.infer<typeof analyticDashboardSchema>;
type AnalyticDashboardFilterMode =
	(typeof analyticDashboardFilterModeValues)[number];

type AnalyticDashboardQuery = {
	mode: AnalyticDashboardFilterMode;
	referenceDate?: string;
	startDate?: string;
	endDate?: string;
};

export type {
	AnalyticDashboard,
	AnalyticDashboardFilterMode,
	AnalyticDashboardQuery,
};
