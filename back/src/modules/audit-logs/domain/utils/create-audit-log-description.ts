import type { AuditAction } from '../../../../shared/domain/enums/audit-action.enum.js';
import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import type {IUserRepository} from '../../../users/domain/repositories/user.repository.js'

// Mapa de roles para texto legível
const ROLE_LABELS: Record<UserRole, string> = {
	ATTENDANT: 'Atendente',
	MANAGER: 'Gerente',
	GENERAL_MANAGER: 'Gerente Geral',
	ADMINISTRATOR: 'Administrador',
};

// Mapa de ações para texto legível
const ACTION_LABELS: Record<AuditAction, string> = {
	USER_LOGIN: 'login no sistema',
	CREATE_LEAD: 'a criação de um Lead',
	UPDATE_LEAD: 'a atualização de um Lead',
	DELETE_LEAD: 'a exclusão de um Lead',
	CREATE_TEAM: 'a criação de um Time',
	UPDATE_TEAM: 'a atualização de um Time',
	DELETE_TEAM: 'a exclusão de um Time',
	CREATE_DEAL: 'a criação de uma Negociação',
	UPDATE_DEAL: 'a atualização de uma Negociação',
	DELETE_DEAL: 'a exclusão de uma Negociação',
	CREATE_STORE: 'a criação de uma Loja',
	UPDATE_STORE: 'a atualização de uma Loja',
	DELETE_STORE: 'a exclusão de uma Loja',
};


interface AuditDescriptionInput {
	readonly actorName: string;
	readonly actorRole: UserRole;
	readonly action: AuditAction;
}

function generateAuditDescription(input: AuditDescriptionInput): string {
	const roleLabel = ROLE_LABELS[input.actorRole];
	const actionLabel = ACTION_LABELS[input.action];

	return `${input.actorName} (${roleLabel}) realizou ${actionLabel}.`;
}

export type { AuditDescriptionInput };
export { generateAuditDescription };