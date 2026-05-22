import { redirect } from 'next/navigation';

import { appRoutes } from '@/lib/routes/app-routes';

function RegisterPage() {
	redirect(appRoutes.auth.login);
}

export default RegisterPage;
