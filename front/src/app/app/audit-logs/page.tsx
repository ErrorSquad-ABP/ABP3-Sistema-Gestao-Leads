import { redirect } from 'next/navigation';

import { AuditLogsPageContent } from '@/features/audit-logs/components/AuditLogsPageContent';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { appRoutes } from '@/lib/routes/app-routes';

async function AuditLogsPage() {
	const user = await getCurrentUserFromRequest();

	if (!user) {
		redirect(appRoutes.auth.login);
	}

	if (user.role !== 'ADMINISTRATOR') {
		redirect(appRoutes.system.forbidden);
	}

	return <AuditLogsPageContent />;
}

export default AuditLogsPage;
