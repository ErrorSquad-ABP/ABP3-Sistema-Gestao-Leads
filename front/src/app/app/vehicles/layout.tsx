import type { ReactNode } from 'react';

import { requireUserWithRouteAccess } from '@/lib/auth/session';

type VehiclesLayoutProps = {
	children: ReactNode;
};

async function VehiclesLayout({ children }: VehiclesLayoutProps) {
	await requireUserWithRouteAccess('vehicles');

	return children;
}

export default VehiclesLayout;

