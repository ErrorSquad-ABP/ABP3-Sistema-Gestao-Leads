import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from './api-error';
import { humanizeApiError, isTechnicalApiMessage } from './humanize-api-error';

describe('isTechnicalApiMessage', () => {
	it('detecta mensagens cruas do Prisma', () => {
		const raw =
			'Invalid `this.client.user.findUnique()` invocation in /app/back/src/modules/users/infrastructure/persistence/repositories/user-prisma.repository.ts:217:21';

		assert.equal(isTechnicalApiMessage(raw), true);
	});
});

describe('humanizeApiError', () => {
	it('oculta erro técnico de login com mensagem amigável', () => {
		const message = humanizeApiError(
			new ApiError(
				'Invalid `this.client.user.findUnique()` invocation in /app/back/src/modules/users/infrastructure/persistence/repositories/user-prisma.repository.ts:217:21 The table `public.UserAccessGroup` does not exist in the current database.',
				500,
			),
			{ context: 'login' },
		);

		assert.equal(
			message,
			'Ocorreu um erro inesperado. Tente novamente em instantes.',
		);
	});

	it('traduz 401 de login para credenciais inválidas', () => {
		assert.equal(
			humanizeApiError(new ApiError('Credenciais inválidas.', 401), {
				context: 'login',
			}),
			'Credenciais inválidas. Verifique o e-mail e a senha informados.',
		);
	});

	it('mantém mensagem de negócio amigável da API', () => {
		assert.equal(
			humanizeApiError(
				new ApiError('O seu perfil não tem permissão para esta operação.', 403),
				{ context: 'modal' },
			),
			'O seu perfil não tem permissão para esta operação.',
		);
	});

	it('prioriza erro de campo em validação 422', () => {
		assert.equal(
			humanizeApiError(
				new ApiError('Erro de validação', 422, {
					errors: [{ code: 'validation.failed', message: 'E-mail inválido.' }],
				}),
				{ context: 'modal' },
			),
			'E-mail inválido.',
		);
	});

	it('mapeia falha de rede para mensagem amigável', () => {
		assert.equal(
			humanizeApiError(
				new ApiError('Não foi possível conectar à API no momento.', 503, {
					code: 'network.unreachable',
				}),
			),
			'Não foi possível ligar ao servidor. Verifique a sua ligação e tente novamente.',
		);
	});

	it('usa fallback de página para 404', () => {
		assert.equal(
			humanizeApiError(new ApiError('Lead not found: abc', 404), {
				context: 'page',
			}),
			'Registo não encontrado.',
		);
	});

	it('usa fallback de conflito para 409 técnico', () => {
		assert.equal(
			humanizeApiError(
				new ApiError('Customer email already exists: x@y.com', 409),
				{ context: 'modal' },
			),
			'Conflito: o registo já existe ou não pode ser removido (existem vínculos).',
		);
	});

	it('oculta erro 500 técnico em modal', () => {
		assert.equal(
			humanizeApiError(
				new ApiError('Internal Server Error: prisma panic', 500),
				{ context: 'modal' },
			),
			'Ocorreu um erro inesperado. Tente novamente em instantes.',
		);
	});

	it('mapeia código conhecido de permissão', () => {
		assert.equal(
			humanizeApiError(
				new ApiError('Denied', 403, { code: 'lead.access.denied' }),
				{ context: 'modal' },
			),
			'O seu perfil não tem permissão para esta operação.',
		);
	});
});
