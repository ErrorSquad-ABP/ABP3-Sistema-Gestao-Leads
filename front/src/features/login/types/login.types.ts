const userRoleValues = [
	'ATTENDANT',
	'MANAGER',
	'GENERAL_MANAGER',
	'ADMINISTRATOR',
] as const;

type UserRole = (typeof userRoleValues)[number];

type AccessFeatureKey =
	| 'dashboardOperational'
	| 'dashboardAnalytic'
	| 'leads'
	| 'users'
	| 'profile'
	| 'credentials'
	| 'reports'
	| 'exports';

type AccessGroupSummary = {
	id: string;
	name: string;
	description: string;
	baseRole: UserRole | null;
	featureKeys: AccessFeatureKey[];
	isSystemGroup: boolean;
};

type AuthenticatedUser = {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	/** Legado: primeiro membro / primeiro gerido; clientes novos devem usar memberTeamIds/managedTeamIds. */
	teamId: string | null;
	memberTeamIds: readonly string[];
	managedTeamIds: readonly string[];
	/** Grupos de acesso vinculados (ADR-001: multi-grupo sem herança). */
	accessGroupIds: readonly string[];
	accessGroups: readonly AccessGroupSummary[];
	/** União deduplicada das features de todos os grupos vinculados. */
	featureKeys: readonly AccessFeatureKey[];
	/** Legado: primeiro grupo ordenado por nome; clientes novos devem usar accessGroups. */
	accessGroupId: string | null;
	accessGroup: AccessGroupSummary | null;
};

type LoginInput = {
	email: string;
	password: string;
};

type LoginResponse = {
	user: AuthenticatedUser;
	accessToken: string;
};

export type { AuthenticatedUser, LoginInput, LoginResponse, UserRole };
export type { AccessFeatureKey, AccessGroupSummary };
export { userRoleValues };
