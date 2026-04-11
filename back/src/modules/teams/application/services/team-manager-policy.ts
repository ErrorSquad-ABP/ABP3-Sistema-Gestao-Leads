import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';

const TEAM_MANAGER_ROLES: readonly UserRole[] = [
	'MANAGER',
	'GENERAL_MANAGER',
	'ADMINISTRATOR',
];

function canManageTeam(role: UserRole): boolean {
	return TEAM_MANAGER_ROLES.includes(role);
}

export { TEAM_MANAGER_ROLES, canManageTeam };
