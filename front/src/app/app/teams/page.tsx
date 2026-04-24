import { redirect } from 'next/navigation';

import { TeamsManagementScreen } from '@/features/teams/components/TeamsManagementScreen';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { appRoutes } from '@/lib/routes/app-routes';

async function TeamsPage() {
	const user = await getCurrentUserFromRequest();

	if (!user) {
		redirect(appRoutes.auth.login);
	}

	return <TeamsManagementScreen user={user} />;
}

export default TeamsPage;
