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
	teamId: string | null;
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
