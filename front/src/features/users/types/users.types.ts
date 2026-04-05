import type { TeamSummary } from '../../teams/types/teams.types';

type UserRole =
	| 'ADMIN'
	| 'ADMINISTRATOR'
	| 'ATTENDANT'
	| 'GENERAL_MANAGER'
	| 'MANAGER';

type UserSummary = {
	readonly id: string;
	readonly name: string;
	readonly email: string;
	readonly role: UserRole;
	readonly teamId: string | null;
	readonly team?: TeamSummary | null;
};

type PaginatedUsersResponse = {
	readonly items: readonly UserSummary[];
	readonly page: number;
	readonly limit: number;
	readonly total: number;
	readonly totalPages: number;
};

export type { PaginatedUsersResponse, UserRole, UserSummary };
