import type { ReactNode } from 'react';

import { requireUserWithRouteAccess } from '@/lib/auth/session';

type CustomersLayoutProps = {
	children: ReactNode;
};

async function CustomersLayout({ children }: CustomersLayoutProps) {
	await requireUserWithRouteAccess('customers');

	return children;
}

export default CustomersLayout;
