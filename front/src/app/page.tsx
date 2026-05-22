import { redirect } from 'next/navigation';

import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { appRoutes } from '@/lib/routes/app-routes';

async function HomePage() {
	const currentUser = await getCurrentUserFromRequest();

	redirect(currentUser ? appRoutes.app.root : appRoutes.auth.login);
}

export default HomePage;
