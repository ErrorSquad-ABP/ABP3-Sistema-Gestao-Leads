import { OperationalDashboardPageContent } from '@/features/dashboard-operational/components/operational-dashboard-page-content';
import { requireUserWithRouteAccess } from '@/lib/auth/session';

async function OperationalDashboardPage() {
	const user = await requireUserWithRouteAccess('dashboardOperational');

	return <OperationalDashboardPageContent user={user} />;
}

export default OperationalDashboardPage;
