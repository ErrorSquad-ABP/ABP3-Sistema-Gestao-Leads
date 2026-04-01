import { LandingPage } from '../features/landing/components/landing-page';
import { getApiStatus } from '../features/landing/server/get-api-status';

export const dynamic = 'force-dynamic';

async function HomePage() {
	const apiStatus = await getApiStatus();

	return <LandingPage apiStatus={apiStatus} />;
}

export default HomePage;
