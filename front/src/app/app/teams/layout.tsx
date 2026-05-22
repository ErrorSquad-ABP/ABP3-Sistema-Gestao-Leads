import type { ReactNode } from 'react';

import { requireUserWithRouteAccess } from '@/lib/auth/session';

type TeamsLayoutProps = {
	children: ReactNode;
};

async function TeamsLayout({ children }: TeamsLayoutProps) {
	await requireUserWithRouteAccess('teams');

	return children;
}

export default TeamsLayout;
