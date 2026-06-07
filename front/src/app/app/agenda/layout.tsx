import type { ReactNode } from 'react';

import { requireUserWithRouteAccess } from '@/lib/auth/session';

type AgendaLayoutProps = {
	children: ReactNode;
};

async function AgendaLayout({ children }: AgendaLayoutProps) {
	await requireUserWithRouteAccess('agenda');

	return children;
}

export default AgendaLayout;
