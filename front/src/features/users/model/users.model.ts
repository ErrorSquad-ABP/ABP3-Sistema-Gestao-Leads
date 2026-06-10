import type {
	AccessFeatureKey,
	AccessGroupSummary,
	UserRole,
} from '@/features/login/types/login.types';

type UserRecord = {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	teamId: string | null;
	/** Grupos vinculados (ADR-001: multi-grupo sem herança). */
	accessGroupIds: string[];
	accessGroups: AccessGroupSummary[];
	/** União deduplicada das features de todos os grupos. */
	featureKeys: AccessFeatureKey[];
	/** Legado: primeiro grupo ordenado por nome. */
	accessGroupId: string | null;
	accessGroup: AccessGroupSummary | null;
};

type UsersSummary = {
	total: number;
	administrators: number;
	withoutGroup: number;
	withMultipleGroups: number;
};

type ListUsersResponse = {
	items: UserRecord[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	summary: UsersSummary;
};

type ListUsersFilters = {
	page: number;
	limit: number;
	search?: string;
	role?: UserRole;
	accessGroupId?: string;
};

type CreateUserInput = {
	name: string;
	email: string;
	password: string;
	role: UserRole;
	teamId?: string | null;
	accessGroupIds: string[];
};

type UpdateUserInput = {
	name?: string;
	email?: string;
	password?: string;
	role?: UserRole;
	teamId?: string | null;
	accessGroupIds?: string[];
};

type AccessGroup = AccessGroupSummary;

const roleLabels: Record<UserRole, string> = {
	ATTENDANT: 'Atendente',
	MANAGER: 'Gerente',
	GENERAL_MANAGER: 'Gerente geral',
	ADMINISTRATOR: 'Administrador',
};

const roleOptions = [
	{ label: roleLabels.ATTENDANT, value: 'ATTENDANT' },
	{ label: roleLabels.MANAGER, value: 'MANAGER' },
	{ label: roleLabels.GENERAL_MANAGER, value: 'GENERAL_MANAGER' },
	{ label: roleLabels.ADMINISTRATOR, value: 'ADMINISTRATOR' },
] as const;

export type {
	AccessFeatureKey,
	AccessGroup,
	CreateUserInput,
	ListUsersFilters,
	ListUsersResponse,
	UpdateUserInput,
	UserRecord,
	UsersSummary,
};
export { roleLabels, roleOptions };
