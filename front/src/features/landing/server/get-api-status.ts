import { env } from '../../../lib/env';
import type { ApiStatusSnapshot } from '../components/landing-page';

async function getApiStatus(): Promise<ApiStatusSnapshot> {
	try {
		const response = await fetch(`${env.apiInternalUrl}/api/health`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			throw new Error(`API responded with status ${response.status}`);
		}

		const payload = (await response.json()) as {
			service: string;
			status: string;
			timestamp: string;
		};

		return {
			endpoint: env.publicApiUrl,
			mode: 'online',
			service: payload.service,
			status: payload.status,
			timestamp: payload.timestamp,
		};
	} catch {
		return {
			endpoint: env.publicApiUrl,
			mode: 'offline',
			service: 'back',
			status: 'indisponivel',
			timestamp: null,
		};
	}
}

export { getApiStatus };
