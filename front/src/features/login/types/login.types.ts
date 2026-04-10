const userRoleValues = [
	'ATTENDANT',
	'MANAGER',
	'GENERAL_MANAGER',
	'ADMINISTRATOR',
] as const;

type UserRole = (typeof userRoleValues)[number];

type AuthenticatedUser = {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	teamId: string | null;
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
export { userRoleValues };
