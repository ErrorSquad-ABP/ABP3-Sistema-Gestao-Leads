import { redirect } from 'next/navigation';

import { appRoutes } from '@/lib/routes/app-routes';

function HomePage() {
	redirect(appRoutes.auth.login);
}

export default HomePage;
