import type { ReactNode } from 'react';

import { getAllowedRolesForRoute } from '@/lib/auth/permissions';
import { requireUserWithRoles } from '@/lib/auth/session';

type LeadsLayoutProps = {
	children: ReactNode;
};

async function LeadsLayout({ children }: LeadsLayoutProps) {
	await requireUserWithRoles(getAllowedRolesForRoute('leads'));

	return children;
}

export default LeadsLayout;
