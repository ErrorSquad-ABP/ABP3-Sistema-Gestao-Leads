import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CRUD_SUCCESS_MESSAGES } from './crud-success-toast';

const ENTITIES = [
	'lead',
	'customer',
	'store',
	'user',
	'accessGroup',
	'team',
	'vehicle',
	'deal',
] as const;

describe('CRUD_SUCCESS_MESSAGES', () => {
	it('define texto PT-BR para create/update/delete em todas as entidades', () => {
		for (const entity of ENTITIES) {
			const messages = Object.entries(CRUD_SUCCESS_MESSAGES).find(
				([entityKey]) => entityKey === entity,
			)?.[1];
			assert.ok(messages);
			assert.match(messages.created, /criad[oa] com sucesso\./);
			assert.match(messages.updated, /atualizad[oa] com sucesso\./);
			assert.match(messages.deleted, /excluíd[oa] com sucesso\./);
		}
	});
});
