import type { ReactNode } from 'react';

import { requireUserWithRoles } from '@/lib/auth/session';

type UsersLayoutProps = {
	children: ReactNode;
};

async function UsersLayout({ children }: UsersLayoutProps) {
	await requireUserWithRoles(['ADMINISTRATOR']);

	return children;
}

export default UsersLayout;
