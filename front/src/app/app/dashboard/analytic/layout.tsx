import type { ReactNode } from 'react';

import { requireUserWithRouteAccess } from '@/lib/auth/session';

type AnalyticDashboardLayoutProps = {
	children: ReactNode;
};

async function AnalyticDashboardLayout({
	children,
}: AnalyticDashboardLayoutProps) {
	await requireUserWithRouteAccess('dashboardAnalytic');

	return children;
}

export default AnalyticDashboardLayout;
