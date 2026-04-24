import { AnalyticDashboardScreen } from '@/features/analytics-dashboard/components/AnalyticDashboardScreen';
import {
	requireAuthenticatedUser,
	requireUserWithRoles,
} from '@/lib/auth/session';

function formatDateInputValue(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

async function AnalyticDashboardPage() {
	await requireUserWithRoles(['MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR']);
	const currentUser = await requireAuthenticatedUser();
	const today = new Date();

	return (
		<AnalyticDashboardScreen
			currentUser={currentUser}
			initialFilter={{
				period: 'month',
				referenceDate: formatDateInputValue(today),
			}}
		/>
	);
}

export default AnalyticDashboardPage;
