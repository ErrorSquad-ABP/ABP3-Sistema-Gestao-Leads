import type {
	AccessFeatureKey,
	AuthenticatedUser,
	UserRole,
} from '@/features/login/types/login.types';
import { appRoutes } from '@/lib/routes/app-routes';

type AppRouteAccessKey =
	| 'customers'
	| 'dashboardAnalytic'
	| 'dashboardOperational'
	| 'leads'
	| 'stores'
	| 'teams'
	| 'users';

type AppNavigationIcon =
	| 'activity'
	| 'chart'
	| 'customers'
	| 'stores'
	| 'teams'
	| 'shield'
	| 'users';

type AppNavigationItem = {
	key: AppRouteAccessKey;
	label: string;
	href: string;
	description: string;
	icon: AppNavigationIcon;
	featureKey: AccessFeatureKey;
	allowedRoles: readonly UserRole[];
};

const roleLabels: Record<UserRole, string> = {
	ADMINISTRATOR: 'Administrador',
	ATTENDANT: 'Atendente',
	GENERAL_MANAGER: 'Gerente Geral',
	MANAGER: 'Gerente',
};

const routeAccessByKey: Record<AppRouteAccessKey, readonly UserRole[]> = {
	customers: ['ATTENDANT', 'MANAGER', 'ADMINISTRATOR'],
	dashboardAnalytic: ['MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR'],
	dashboardOperational: ['MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR'],
	leads: ['ATTENDANT', 'MANAGER', 'ADMINISTRATOR'],
	stores: ['MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR'],
	teams: ['MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR'],
	users: ['ADMINISTRATOR'],
};

const appNavigationItems: readonly AppNavigationItem[] = [
	{
		allowedRoles: routeAccessByKey.dashboardOperational,
		description: 'Indicadores e acompanhamento diário da operação.',
		featureKey: 'dashboardOperational',
		href: appRoutes.app.dashboard.operational,
		icon: 'activity',
		key: 'dashboardOperational',
		label: 'Dashboard Operacional',
	},
	{
		allowedRoles: routeAccessByKey.dashboardAnalytic,
		description: 'Leitura consolidada de desempenho e conversão.',
		featureKey: 'dashboardAnalytic',
		href: appRoutes.app.dashboard.analytic,
		icon: 'chart',
		key: 'dashboardAnalytic',
		label: 'Dashboard Analítico',
	},
	{
		allowedRoles: routeAccessByKey.customers,
		description: 'Cadastro comercial de clientes vinculados aos leads.',
		featureKey: 'leads',
		href: appRoutes.app.customers,
		icon: 'customers',
		key: 'customers',
		label: 'Clientes',
	},
	{
		allowedRoles: routeAccessByKey.leads,
		description: 'Fluxo comercial, priorização e acompanhamento.',
		featureKey: 'leads',
		href: appRoutes.app.leads,
		icon: 'users',
		key: 'leads',
		label: 'Leads',
	},
	{
		allowedRoles: routeAccessByKey.stores,
		description: 'Estrutura física disponível para distribuição operacional.',
		featureKey: 'leads',
		href: appRoutes.app.stores,
		icon: 'stores',
		key: 'stores',
		label: 'Lojas',
	},
	{
		allowedRoles: routeAccessByKey.teams,
		description: 'Estrutura humana por loja, gerente e composição operacional.',
		featureKey: 'leads',
		href: appRoutes.app.teams,
		icon: 'teams',
		key: 'teams',
		label: 'Equipes',
	},
	{
		allowedRoles: routeAccessByKey.users,
		description: 'Gestão administrativa de perfis e acessos.',
		featureKey: 'users',
		href: appRoutes.app.users,
		icon: 'shield',
		key: 'users',
		label: 'Usuários',
	},
] as const;

function getAllowedRolesForRoute(key: AppRouteAccessKey) {
	switch (key) {
		case 'customers':
			return routeAccessByKey.customers;
		case 'dashboardAnalytic':
			return routeAccessByKey.dashboardAnalytic;
		case 'dashboardOperational':
			return routeAccessByKey.dashboardOperational;
		case 'leads':
			return routeAccessByKey.leads;
		case 'stores':
			return routeAccessByKey.stores;
		case 'teams':
			return routeAccessByKey.teams;
		case 'users':
			return routeAccessByKey.users;
	}
}

function canRoleAccessRoute(role: UserRole, key: AppRouteAccessKey) {
	return getAllowedRolesForRoute(key).includes(role);
}

function hasFeatureAccess(
	user: Pick<AuthenticatedUser, 'role' | 'accessGroup'>,
	key: AppRouteAccessKey,
) {
	if (!canRoleAccessRoute(user.role, key)) {
		return false;
	}

	if (!user.accessGroup) {
		return true;
	}

	return user.accessGroup.featureKeys.includes(
		appNavigationItems.find((item) => item.key === key)?.featureKey ??
			'profile',
	);
}

function getNavigationItemsForUser(user: AuthenticatedUser) {
	return appNavigationItems.filter((item) => hasFeatureAccess(user, item.key));
}

function resolveDefaultAppRoute(user: AuthenticatedUser) {
	const firstAllowed = getNavigationItemsForUser(user)[0];
	return firstAllowed?.href ?? appRoutes.system.forbidden;
}

export {
	appNavigationItems,
	canRoleAccessRoute,
	getAllowedRolesForRoute,
	getNavigationItemsForUser,
	hasFeatureAccess,
	roleLabels,
	resolveDefaultAppRoute,
};
export type { AppNavigationIcon, AppNavigationItem, AppRouteAccessKey };
