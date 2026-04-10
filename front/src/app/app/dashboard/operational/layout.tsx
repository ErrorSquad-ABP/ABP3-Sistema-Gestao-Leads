import type { ReactNode } from 'react';

import { requireUserWithRoles } from '@/lib/auth/session';

type OperationalDashboardLayoutProps = {
	children: ReactNode;
};

async function OperationalDashboardLayout({
	children,
}: OperationalDashboardLayoutProps) {
	await requireUserWithRoles(['MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR']);

	return children;
}

export default OperationalDashboardLayout;
