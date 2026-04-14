import type { ReactNode } from 'react';

import { getAllowedRolesForRoute } from '@/lib/auth/permissions';
import { requireUserWithRoles } from '@/lib/auth/session';

type UsersLayoutProps = {
	children: ReactNode;
};

async function UsersLayout({ children }: UsersLayoutProps) {
	await requireUserWithRoles(getAllowedRolesForRoute('users'));

	return children;
}

export default UsersLayout;
