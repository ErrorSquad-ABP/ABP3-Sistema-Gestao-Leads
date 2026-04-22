import type { ReactNode } from 'react';

import { requireUserWithRouteAccess } from '@/lib/auth/session';

type DealsLayoutProps = {
	children: ReactNode;
};

async function DealsLayout({ children }: DealsLayoutProps) {
	await requireUserWithRouteAccess('deals');

	return children;
}

export default DealsLayout;
