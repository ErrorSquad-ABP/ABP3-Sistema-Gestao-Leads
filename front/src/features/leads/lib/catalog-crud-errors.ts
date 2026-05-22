import { isApiError } from '@/lib/http/api-error';

function getCatalogCrudErrorMessage(error: unknown) {
	if (!isApiError(error)) {
		return 'Não foi possível concluir a operação agora. Tente novamente em instantes.';
	}

	if (error.status === 403) {
		return (
			error.message || 'O seu perfil não tem permissão para esta operação.'
		);
	}

	if (error.status === 404) {
		return error.message || 'Registo não encontrado.';
	}

	if (error.status === 409) {
		return (
			error.message ||
			'Conflito: o registo já existe ou não pode ser removido (existem vínculos).'
		);
	}

	return error.message || 'A operação falhou.';
}

export { getCatalogCrudErrorMessage };
