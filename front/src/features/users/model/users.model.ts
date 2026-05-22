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
	accessGroupId: string | null;
	accessGroup: AccessGroupSummary | null;
};

type ListUsersResponse = {
	items: UserRecord[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

type CreateUserInput = {
	name: string;
	email: string;
	password: string;
	role: UserRole;
	teamId?: string | null;
	accessGroupId?: string | null;
};

type UpdateUserInput = {
	name?: string;
	email?: string;
	password?: string;
	role?: UserRole;
	teamId?: string | null;
	accessGroupId?: string | null;
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
	ListUsersResponse,
	UpdateUserInput,
	UserRecord,
};
export { roleLabels, roleOptions };
