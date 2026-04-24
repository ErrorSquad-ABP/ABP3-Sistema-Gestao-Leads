import type { ReactNode } from 'react';

import { requireUserWithRouteAccess } from '@/lib/auth/session';

type StoresLayoutProps = {
	children: ReactNode;
};

async function StoresLayout({ children }: StoresLayoutProps) {
	await requireUserWithRouteAccess('stores');

	return children;
}

export default StoresLayout;
