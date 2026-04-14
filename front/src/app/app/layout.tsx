import type { ReactNode } from 'react';

import AppSidebar from '@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar';
import { requireAuthenticatedUser } from '@/lib/auth/session';

type ProtectedAppLayoutProps = {
	children: ReactNode;
};

async function ProtectedAppLayout({ children }: ProtectedAppLayoutProps) {
	const currentUser = await requireAuthenticatedUser();

	return <AppSidebar currentUser={currentUser}>{children}</AppSidebar>;
}

export default ProtectedAppLayout;
