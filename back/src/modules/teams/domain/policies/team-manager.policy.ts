import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import { DomainValidationError } from '../../../../shared/domain/errors/domain-validation.error.js';
import type { UUID } from '../../../../shared/domain/types/identifiers.js';
import { TeamInvalidManagerError } from '../errors/team-invalid-manager.error.js';

const TEAM_MANAGER_ROLES: readonly UserRole[] = [
	'MANAGER',
	'GENERAL_MANAGER',
	'ADMINISTRATOR',
];

function isTeamManagerRole(role: UserRole): boolean {
	return TEAM_MANAGER_ROLES.includes(role);
}

/**
 * Papel compatível com a semântica de `TeamManager` / `managerId` no agregado.
 * Alias mantém o nome usado nos casos de uso e testes.
 */
function canManageTeam(role: UserRole): boolean {
	return isTeamManagerRole(role);
}

/**
 * Estado permitido: sem gerente (`null,null`) ou gerente com papel de gestão.
 * Inconsistências (ex.: id sem papel) indicam uso incorreto da API do agregado.
 */
function assertTeamManagerAssignment(
	managerId: UUID | null,
	managerRole: UserRole | null,
): void {
	if (managerId === null && managerRole === null) {
		return;
	}
	if (managerId === null || managerRole === null) {
		throw new DomainValidationError(
			'Atribuição de gerente exige identificador e papel coerentes.',
			{ code: 'team.manager.inconsistent_assignment' },
		);
	}
	if (!isTeamManagerRole(managerRole)) {
		throw new TeamInvalidManagerError(managerId.value);
	}
}

export {
	TEAM_MANAGER_ROLES,
	assertTeamManagerAssignment,
	canManageTeam,
	isTeamManagerRole,
};
