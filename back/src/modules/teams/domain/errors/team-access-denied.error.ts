/**
 * Utilizador autenticado não tem permissão para a equipe/loja alvo (escopo comercial).
 */
class TeamAccessDeniedError extends Error {
	readonly code = 'team.access.denied';

	constructor(message = 'Sem permissao para esta equipe ou loja.') {
		super(message);
		this.name = 'TeamAccessDeniedError';
	}
}

export { TeamAccessDeniedError };
