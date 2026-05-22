import { redirect } from 'next/navigation';

import { StoresManagementScreen } from '@/features/stores/components/StoresManagementScreen';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { appRoutes } from '@/lib/routes/app-routes';

async function StoresPage() {
	const user = await getCurrentUserFromRequest();

	if (!user) {
		redirect(appRoutes.auth.login);
	}

	return <StoresManagementScreen user={user} />;
}

export default StoresPage;
