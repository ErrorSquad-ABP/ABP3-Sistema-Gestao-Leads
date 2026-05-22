import type { ReactNode } from 'react';

import { requireUserWithRouteAccess } from '@/lib/auth/session';

type OperationsLayoutProps = {
	children: ReactNode;
};

async function OperationsLayout({ children }: OperationsLayoutProps) {
	await requireUserWithRouteAccess('stores');

	return children;
}

export default OperationsLayout;
