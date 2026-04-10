import type { ReactNode } from 'react';

import { requireUserWithRoles } from '@/lib/auth/session';

type AnalyticDashboardLayoutProps = {
	children: ReactNode;
};

async function AnalyticDashboardLayout({
	children,
}: AnalyticDashboardLayoutProps) {
	await requireUserWithRoles(['MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR']);

	return children;
}

export default AnalyticDashboardLayout;
