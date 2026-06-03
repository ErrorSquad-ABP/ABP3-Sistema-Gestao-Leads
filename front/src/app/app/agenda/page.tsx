import { redirect } from 'next/navigation';

import { AgendaPageContent } from '@/features/agenda/components/AgendaPageContent';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { appRoutes } from '@/lib/routes/app-routes';

async function AgendaPage() {
	const user = await getCurrentUserFromRequest();

	if (!user) {
		redirect(appRoutes.auth.login);
	}

	return <AgendaPageContent />;
}

export default AgendaPage;
