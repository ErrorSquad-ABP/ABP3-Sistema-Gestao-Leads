import type { ReactNode } from 'react';

import { requireUserWithRoles } from '@/lib/auth/session';

type OperationalDashboardLayoutProps = {
	children: ReactNode;
};

async function OperationalDashboardLayout({
	children,
}: OperationalDashboardLayoutProps) {
	await requireUserWithRoles(['MANAGER']);

	return children;
}

export default OperationalDashboardLayout;
