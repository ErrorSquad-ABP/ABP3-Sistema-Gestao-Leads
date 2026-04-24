/**
 * Utilizador autenticado não tem permissão para o lead / escopo comercial alvo.
 */
class LeadAccessDeniedError extends Error {
	readonly code = 'lead.access.denied';

	constructor(message = 'Sem permissao para este lead ou escopo relacionado.') {
		super(message);
		this.name = 'LeadAccessDeniedError';
	}
}

export { LeadAccessDeniedError };
