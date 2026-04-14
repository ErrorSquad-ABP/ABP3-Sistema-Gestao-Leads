import type { ReactNode } from 'react';

import { requireUserWithRouteAccess } from '@/lib/auth/session';

type UsersLayoutProps = {
	children: ReactNode;
};

async function UsersLayout({ children }: UsersLayoutProps) {
	await requireUserWithRouteAccess('users');

	return children;
}

export default UsersLayout;
