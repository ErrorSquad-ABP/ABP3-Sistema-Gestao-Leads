import { redirect } from 'next/navigation';

import { AnalyticDashboardPageContent } from '@/features/dashboard-analytic/components/analytic-dashboard-page-content';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { appRoutes } from '@/lib/routes/app-routes';

async function AnalyticDashboardPage() {
	const user = await getCurrentUserFromRequest();

	if (!user) {
		redirect(appRoutes.auth.login);
	}

	return <AnalyticDashboardPageContent user={user} />;
}

export default AnalyticDashboardPage;
