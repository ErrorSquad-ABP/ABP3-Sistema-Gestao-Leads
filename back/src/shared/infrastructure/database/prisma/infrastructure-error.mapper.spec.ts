import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Prisma } from '../../../../generated/prisma/client.js';
import { mapInfrastructureException } from './infrastructure-error.mapper.js';

describe('mapInfrastructureException', () => {
	it('humaniza erro de tabela inexistente do Prisma', () => {
		const mapped = mapInfrastructureException(
			new Prisma.PrismaClientKnownRequestError(
				'The table `public.UserAccessGroup` does not exist in the current database.',
				{
					code: 'P2021',
					clientVersion: 'test',
				},
			),
		);

		assert.equal(mapped?.status, 503);
		assert.equal(
			mapped?.body.message,
			'Serviço temporariamente indisponível. Tente novamente em instantes.',
		);
		assert.equal(mapped?.body.errors?.[0]?.code, 'database.schema_outdated');
	});

	it('humaniza mensagens técnicas não mapeadas explicitamente', () => {
		const mapped = mapInfrastructureException(
			new Error(
				'Invalid `this.client.user.findUnique()` invocation in /app/back/src/modules/users/infrastructure/persistence/repositories/user-prisma.repository.ts:217:21',
			),
		);

		assert.equal(mapped?.status, 500);
		assert.equal(
			mapped?.body.message,
			'Ocorreu um erro inesperado. Tente novamente em instantes.',
		);
		assert.equal(mapped?.body.errors?.[0]?.code, 'internal.server_error');
	});
});
