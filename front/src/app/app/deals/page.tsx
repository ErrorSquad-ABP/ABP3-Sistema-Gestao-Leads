import { redirect } from 'next/navigation';

import { DealsPageContent } from '@/features/deals/components/deals-page-content';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { appRoutes } from '@/lib/routes/app-routes';

async function DealsHomePage() {
	const user = await getCurrentUserFromRequest();

	if (!user) {
		redirect(appRoutes.auth.login);
	}

	return <DealsPageContent />;
}

export default DealsHomePage;
