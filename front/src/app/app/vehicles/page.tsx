import { redirect } from 'next/navigation';

import { VehiclesPageContent } from '@/features/vehicles/components/vehicles-page-content';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { appRoutes } from '@/lib/routes/app-routes';

async function VehiclesHomePage() {
	const user = await getCurrentUserFromRequest();

	if (!user) {
		redirect(appRoutes.auth.login);
	}

	return <VehiclesPageContent user={user} />;
}

export default VehiclesHomePage;
