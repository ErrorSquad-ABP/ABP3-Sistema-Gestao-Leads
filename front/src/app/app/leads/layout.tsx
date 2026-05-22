import type { ReactNode } from 'react';

import { requireUserWithRouteAccess } from '@/lib/auth/session';

type LeadsLayoutProps = {
	children: ReactNode;
};

async function LeadsLayout({ children }: LeadsLayoutProps) {
	await requireUserWithRouteAccess('leads');

	return children;
}

export default LeadsLayout;
