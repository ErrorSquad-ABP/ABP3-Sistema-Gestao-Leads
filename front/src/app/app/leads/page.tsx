import { redirect } from 'next/navigation';

import { LeadsPageContent } from '@/features/leads/components/leads-page-content';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { appRoutes } from '@/lib/routes/app-routes';

async function LeadsHomePage() {
	const user = await getCurrentUserFromRequest();

	if (!user) {
		redirect(appRoutes.auth.login);
	}

	return <LeadsPageContent user={user} />;
}

export default LeadsHomePage;
