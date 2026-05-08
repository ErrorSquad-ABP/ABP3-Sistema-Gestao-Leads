import { redirect } from 'next/navigation';

import { LeadDetailPageContent } from '@/features/leads/components/LeadDetailPageContent';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { appRoutes } from '@/lib/routes/app-routes';

type LeadDetailPageProps = {
	params: Promise<{ id: string }>;
};

async function LeadDetailPage({ params }: LeadDetailPageProps) {
	const user = await getCurrentUserFromRequest();

	if (!user) {
		redirect(appRoutes.auth.login);
	}

	const { id } = await params;

	return <LeadDetailPageContent leadId={id} user={user} />;
}

export default LeadDetailPage;
