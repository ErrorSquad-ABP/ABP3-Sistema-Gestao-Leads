import type { UserRole } from '@/features/login/types/login.types';
import { appRoutes } from '@/lib/routes/app-routes';

function resolveHomeRouteByRole(role: UserRole) {
	switch (role) {
		case 'ATTENDANT':
			return appRoutes.app.leads;
		case 'MANAGER':
			return appRoutes.app.dashboard.operational;
		case 'GENERAL_MANAGER':
		case 'ADMINISTRATOR':
			return appRoutes.app.dashboard.analytic;
	}
}

export { resolveHomeRouteByRole };
