import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { AuthenticatedUser } from '../../login/types/login.types';

import {
	mergeLeadListsById,
	readableTeamIdsForLeadsList,
	resolveLeadsListScope,
} from './leads-scope';

const baseUser = {
	id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
	name: 'Test',
	email: 't@example.com',
	teamId: null,
	accessGroupId: null,
	accessGroup: null,
} satisfies Omit<AuthenticatedUser, 'role' | 'memberTeamIds' | 'managedTeamIds'>;

describe('readableTeamIdsForLeadsList', () => {
	it('MANAGER: união membro e geridos', () => {
		const u = {
			...baseUser,
			role: 'MANAGER' as const,
			memberTeamIds: ['bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'],
			managedTeamIds: ['cccccccc-cccc-4ccc-8ccc-cccccccccccc'],
		};
		const ids = readableTeamIdsForLeadsList(u);
		assert.deepEqual(ids, [
			'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
			'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
		]);
	});

	it('GENERAL_MANAGER: vazio (escopo global na UI via listAll)', () => {
		const u = {
			...baseUser,
			role: 'GENERAL_MANAGER' as const,
			memberTeamIds: ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'],
			managedTeamIds: ['bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'],
		};
		assert.deepEqual(readableTeamIdsForLeadsList(u), []);
	});
});

describe('resolveLeadsListScope', () => {
	it('ATTENDANT: owner', () => {
		const u = {
			...baseUser,
			role: 'ATTENDANT' as const,
			memberTeamIds: [],
			managedTeamIds: [],
		};
		assert.deepEqual(resolveLeadsListScope(u), {
			kind: 'owner',
			id: u.id,
		});
	});

	it('MANAGER sem equipas: none', () => {
		const u = {
			...baseUser,
			role: 'MANAGER' as const,
			memberTeamIds: [],
			managedTeamIds: [],
		};
		assert.deepEqual(resolveLeadsListScope(u), {
			kind: 'none',
			reason: 'no_teams',
		});
	});

	it('MANAGER com várias equipas: teams', () => {
		const u = {
			...baseUser,
			role: 'MANAGER' as const,
			memberTeamIds: ['bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'],
			managedTeamIds: ['cccccccc-cccc-4ccc-8ccc-cccccccccccc'],
		};
		const s = resolveLeadsListScope(u);
		assert.equal(s?.kind, 'teams');
		if (s?.kind === 'teams') {
			assert.equal(s.ids.length, 2);
		}
	});

	it('ADMINISTRATOR: all', () => {
		const u = {
			...baseUser,
			role: 'ADMINISTRATOR' as const,
			memberTeamIds: [],
			managedTeamIds: [],
		};
		assert.deepEqual(resolveLeadsListScope(u), { kind: 'all' });
	});

	it('GENERAL_MANAGER: sempre all', () => {
		const u = {
			...baseUser,
			role: 'GENERAL_MANAGER' as const,
			memberTeamIds: [],
			managedTeamIds: ['bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'],
		};
		assert.deepEqual(resolveLeadsListScope(u), { kind: 'all' });
	});

	it('GENERAL_MANAGER com membros: all', () => {
		const u = {
			...baseUser,
			role: 'GENERAL_MANAGER' as const,
			memberTeamIds: ['bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'],
			managedTeamIds: [],
		};
		assert.deepEqual(resolveLeadsListScope(u), { kind: 'all' });
	});
});

describe('mergeLeadListsById', () => {
	it('dedupe por id', () => {
		const a = {
			id: '11111111-1111-4111-8111-111111111111',
			customerId: '22222222-2222-4222-8222-222222222222',
			storeId: '33333333-3333-4333-8333-333333333333',
			ownerUserId: null,
			source: 'x',
			status: 'NEW',
		};
		const out = mergeLeadListsById([
			[a],
			[
				{
					...a,
					status: 'IGNORED',
				},
			],
		]);
		assert.equal(out.length, 1);
		assert.equal(out[0]?.status, 'NEW');
	});
});
