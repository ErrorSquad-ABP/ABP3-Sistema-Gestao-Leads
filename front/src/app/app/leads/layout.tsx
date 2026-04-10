import type { ReactNode } from 'react';

import { requireUserWithRoles } from '@/lib/auth/session';

type LeadsLayoutProps = {
	children: ReactNode;
};

async function LeadsLayout({ children }: LeadsLayoutProps) {
	await requireUserWithRoles(['ATTENDANT', 'MANAGER', 'ADMINISTRATOR']);

	return children;
}

export default LeadsLayout;
