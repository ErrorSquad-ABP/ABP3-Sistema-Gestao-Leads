import type { ReactNode } from 'react';

import { requireAuthenticatedUser } from '@/lib/auth/session';

type ProtectedAppLayoutProps = {
	children: ReactNode;
};

async function ProtectedAppLayout({ children }: ProtectedAppLayoutProps) {
	await requireAuthenticatedUser();

	return children;
}

export default ProtectedAppLayout;
