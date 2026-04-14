import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ForbiddenException } from '@nestjs/common';

import {
	requireListAllLeadsAllowed,
	requireListByOwnerAllowed,
	requireListByTeamAllowed,
} from './lead-list-access.util.js';

describe('lead-list-access.util', () => {
	describe('requireListByOwnerAllowed', () => {
		it('permite quando o id coincide', () => {
			requireListByOwnerAllowed(
				'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
				'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
			);
		});

		it('lança Forbidden quando o id difere', () => {
			assert.throws(
				() =>
					requireListByOwnerAllowed(
						'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
						'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
					),
				ForbiddenException,
			);
		});
	});

	describe('requireListByTeamAllowed', () => {
		const team = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

		it('permite gestor com equipa coincidente', () => {
			requireListByTeamAllowed('MANAGER', team, team);
		});

		it('rejeita atendente', () => {
			assert.throws(
				() => requireListByTeamAllowed('ATTENDANT', team, team),
				ForbiddenException,
			);
		});

		it('rejeita equipa diferente', () => {
			assert.throws(
				() =>
					requireListByTeamAllowed(
						'MANAGER',
						team,
						'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
					),
				ForbiddenException,
			);
		});

		it('rejeita sem equipa', () => {
			assert.throws(
				() =>
					requireListByTeamAllowed(
						'MANAGER',
						null,
						'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
					),
				ForbiddenException,
			);
		});

		it('permite administrador sem equipa na conta a listar qualquer equipa', () => {
			requireListByTeamAllowed(
				'ADMINISTRATOR',
				null,
				'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
			);
		});

		it('permite administrador com equipa diferente da pedida (alcance global)', () => {
			requireListByTeamAllowed(
				'ADMINISTRATOR',
				'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
				'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
			);
		});
	});

	describe('requireListAllLeadsAllowed', () => {
		it('permite administrador', () => {
			requireListAllLeadsAllowed('ADMINISTRATOR');
		});

		it('rejeita gestor', () => {
			assert.throws(
				() => requireListAllLeadsAllowed('MANAGER'),
				ForbiddenException,
			);
		});
	});
});
