import type { ReactNode } from 'react';

import { requireUserWithRouteAccess } from '@/lib/auth/session';

type OperationalDashboardLayoutProps = {
	children: ReactNode;
};

async function OperationalDashboardLayout({
	children,
}: OperationalDashboardLayoutProps) {
	await requireUserWithRouteAccess('dashboardOperational');

	return children;
}

export default OperationalDashboardLayout;
