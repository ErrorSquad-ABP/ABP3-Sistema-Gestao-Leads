import type { ReactNode } from 'react';

import { getAllowedRolesForRoute } from '@/lib/auth/permissions';
import { requireUserWithRoles } from '@/lib/auth/session';

type AnalyticDashboardLayoutProps = {
	children: ReactNode;
};

async function AnalyticDashboardLayout({
	children,
}: AnalyticDashboardLayoutProps) {
	await requireUserWithRoles(getAllowedRolesForRoute('dashboardAnalytic'));

	return children;
}

export default AnalyticDashboardLayout;
