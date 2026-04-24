import { redirect } from 'next/navigation';

import { appRoutes } from '@/lib/routes/app-routes';

async function OperationsPage() {
	redirect(appRoutes.app.stores);
}

export default OperationsPage;
