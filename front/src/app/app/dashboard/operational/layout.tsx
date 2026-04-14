import type { ReactNode } from 'react';

import { getAllowedRolesForRoute } from '@/lib/auth/permissions';
import { requireUserWithRoles } from '@/lib/auth/session';

type OperationalDashboardLayoutProps = {
	children: ReactNode;
};

async function OperationalDashboardLayout({
	children,
}: OperationalDashboardLayoutProps) {
	await requireUserWithRoles(getAllowedRolesForRoute('dashboardOperational'));

	return children;
}

export default OperationalDashboardLayout;
