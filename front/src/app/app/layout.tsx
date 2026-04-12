import type { ReactNode } from 'react';

import { AppShell } from '@/features/app-shell/components/AppShell';
import { requireAuthenticatedUser } from '@/lib/auth/session';

type ProtectedAppLayoutProps = {
	children: ReactNode;
};

async function ProtectedAppLayout({ children }: ProtectedAppLayoutProps) {
	const currentUser = await requireAuthenticatedUser();

	return <AppShell user={currentUser}>{children}</AppShell>;
}

export default ProtectedAppLayout;
