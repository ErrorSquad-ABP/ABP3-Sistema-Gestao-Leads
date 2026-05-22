import { redirectToHomeRouteForRequestUser } from '@/lib/auth/session';

async function AppEntryPage() {
	await redirectToHomeRouteForRequestUser();
}

export default AppEntryPage;
