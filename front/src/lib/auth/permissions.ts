import type { UserRole } from '@/features/login/types/login.types';
import { appRoutes } from '@/lib/routes/app-routes';

type AppRouteAccessKey =
	| 'dashboardAnalytic'
	| 'dashboardOperational'
	| 'leads'
	| 'users';

type AppNavigationIcon = 'activity' | 'chart' | 'shield' | 'users';

type AppNavigationItem = {
	key: AppRouteAccessKey;
	label: string;
	href: string;
	description: string;
	icon: AppNavigationIcon;
	allowedRoles: readonly UserRole[];
};

const roleLabels: Record<UserRole, string> = {
	ADMINISTRATOR: 'Administrador',
	ATTENDANT: 'Atendente',
	GENERAL_MANAGER: 'Gerente Geral',
	MANAGER: 'Gerente',
};

const routeAccessByKey: Record<AppRouteAccessKey, readonly UserRole[]> = {
	dashboardAnalytic: ['MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR'],
	dashboardOperational: ['MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR'],
	leads: ['ATTENDANT', 'MANAGER', 'ADMINISTRATOR'],
	users: ['ADMINISTRATOR'],
};

const appNavigationItems: readonly AppNavigationItem[] = [
	{
		allowedRoles: routeAccessByKey.dashboardOperational,
		description: 'Indicadores e acompanhamento diário da operação.',
		href: appRoutes.app.dashboard.operational,
		icon: 'activity',
		key: 'dashboardOperational',
		label: 'Dashboard Operacional',
	},
	{
		allowedRoles: routeAccessByKey.dashboardAnalytic,
		description: 'Leitura consolidada de desempenho e conversão.',
		href: appRoutes.app.dashboard.analytic,
		icon: 'chart',
		key: 'dashboardAnalytic',
		label: 'Dashboard Analítico',
	},
	{
		allowedRoles: routeAccessByKey.leads,
		description: 'Fluxo comercial, priorização e acompanhamento.',
		href: appRoutes.app.leads,
		icon: 'users',
		key: 'leads',
		label: 'Leads',
	},
	{
		allowedRoles: routeAccessByKey.users,
		description: 'Gestão administrativa de perfis e acessos.',
		href: appRoutes.app.users,
		icon: 'shield',
		key: 'users',
		label: 'Usuários',
	},
] as const;

function getAllowedRolesForRoute(key: AppRouteAccessKey) {
	switch (key) {
		case 'dashboardAnalytic':
			return routeAccessByKey.dashboardAnalytic;
		case 'dashboardOperational':
			return routeAccessByKey.dashboardOperational;
		case 'leads':
			return routeAccessByKey.leads;
		case 'users':
			return routeAccessByKey.users;
	}
}

function getNavigationItemsForRole(role: UserRole) {
	return appNavigationItems.filter((item) => item.allowedRoles.includes(role));
}

export {
	appNavigationItems,
	getAllowedRolesForRoute,
	getNavigationItemsForRole,
	roleLabels,
};
export type { AppNavigationIcon, AppNavigationItem, AppRouteAccessKey };
