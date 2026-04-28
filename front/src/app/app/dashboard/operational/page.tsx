import { redirect } from 'next/navigation';

import { OperationalDashboardPageContent } from '@/features/dashboard-operational/components/operational-dashboard-page-content';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { appRoutes } from '@/lib/routes/app-routes';

async function OperationalDashboardPage() {
	const user = await getCurrentUserFromRequest();

	if (!user) {
		redirect(appRoutes.auth.login);
	}

	return <OperationalDashboardPageContent user={user} />;
}

export default OperationalDashboardPage;
