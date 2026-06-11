import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from './api-error';
import {
	applyApiFormErrors,
	applyFormSubmitErrors,
	hasApiFieldErrors,
	mapApiFieldErrors,
	resolveFormSubmitError,
} from './apply-api-form-errors';

describe('mapApiFieldErrors', () => {
	it('mapeia código conhecido para campo', () => {
		const mapped = mapApiFieldErrors(
			new ApiError('Customer email already exists', 409, {
				code: 'customer.email_already_exists',
			}),
		);

		assert.deepEqual(mapped, {
			email: 'Já existe um cliente com este e-mail.',
		});
	});

	it('usa details.field quando presente', () => {
		const mapped = mapApiFieldErrors(
			new ApiError('Validação', 422, {
				errors: [
					{
						code: 'validation.failed',
						message: 'CPF inválido.',
						details: { field: 'cpf' },
					},
				],
			}),
		);

		assert.deepEqual(mapped, { cpf: 'CPF inválido.' });
	});
});

describe('applyApiFormErrors', () => {
	it('aplica erros de campo no formulário', () => {
		const fieldErrors: Array<{ field: string; message: string }> = [];
		const setError = (field: string, payload: { message?: string }) => {
			fieldErrors.push({
				field,
				message: payload.message ?? '',
			});
		};

		const applied = applyApiFormErrors(
			setError as never,
			new ApiError('Customer cpf already exists', 409, {
				code: 'customer.cpf_already_exists',
			}),
		);

		assert.equal(applied, true);
		assert.deepEqual(fieldErrors, [
			{
				field: 'cpf',
				message: 'Já existe um cliente com este CPF.',
			},
		]);
	});

	it('retorna false quando não há erros de campo', () => {
		let called = false;
		const setError = () => {
			called = true;
		};

		const applied = applyApiFormErrors(
			setError as never,
			new ApiError('Sem permissão', 403),
		);

		assert.equal(applied, false);
		assert.equal(called, false);
	});
});

describe('resolveFormSubmitError', () => {
	it('retorna null quando há erro de campo mapeável', () => {
		assert.equal(
			resolveFormSubmitError(
				new ApiError('Customer email already exists', 409, {
					code: 'customer.email_already_exists',
				}),
			),
			null,
		);
	});

	it('retorna banner humanizado quando não há campo mapeável', () => {
		assert.equal(
			resolveFormSubmitError(
				new ApiError('lead.access.denied raw', 403, {
					code: 'lead.access.denied',
				}),
			),
			'O seu perfil não tem permissão para esta operação.',
		);
	});
});

describe('applyFormSubmitErrors', () => {
	it('combina mapeamento de campo com banner condicional', () => {
		const fieldErrors: Array<{ field: string; message: string }> = [];
		const setError = (field: string, payload: { message?: string }) => {
			fieldErrors.push({
				field,
				message: payload.message ?? '',
			});
		};

		const banner = applyFormSubmitErrors(
			setError as never,
			new ApiError('Customer cpf already exists', 409, {
				code: 'customer.cpf_already_exists',
			}),
		);

		assert.equal(banner, null);
		assert.equal(fieldErrors.length, 1);
	});
});

describe('hasApiFieldErrors', () => {
	it('detecta presença de erros mapeáveis', () => {
		assert.equal(
			hasApiFieldErrors(
				new ApiError('User email already exists', 409, {
					code: 'user.email_already_exists',
				}),
			),
			true,
		);
		assert.equal(hasApiFieldErrors(new ApiError('Erro', 500)), false);
	});
});
