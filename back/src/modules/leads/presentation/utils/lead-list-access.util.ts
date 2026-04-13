import { ForbiddenException } from '@nestjs/common';

const TEAM_LIST_ROLES = new Set<string>([
	'MANAGER',
	'GENERAL_MANAGER',
	'ADMINISTRATOR',
]);

function requireListByOwnerAllowed(
	currentUserId: string,
	ownerUserId: string,
): void {
	if (currentUserId !== ownerUserId) {
		throw new ForbiddenException(
			'Não é possível listar leads de outro utilizador.',
		);
	}
}

function requireListByTeamAllowed(
	currentRole: string,
	currentUserTeamId: string | null,
	requestedTeamId: string,
): void {
	if (!TEAM_LIST_ROLES.has(currentRole)) {
		throw new ForbiddenException(
			'Perfil sem permissão para listagem por equipa.',
		);
	}
	if (currentUserTeamId === null) {
		throw new ForbiddenException('Utilizador sem equipa atribuída.');
	}
	if (currentUserTeamId !== requestedTeamId) {
		throw new ForbiddenException('A equipa solicitada não coincide com a sua.');
	}
}

export { requireListByOwnerAllowed, requireListByTeamAllowed };
