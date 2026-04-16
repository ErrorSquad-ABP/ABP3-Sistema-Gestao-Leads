import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LeadAccessDeniedError } from '../../../leads/domain/errors/lead-access-denied.error.js';
import { ListDealsUseCase } from './list-deals.use-case.js';

describe('ListDealsUseCase', () => {
	it('attendant forces ownerUserId to self', async () => {
		const calls: unknown[] = [];
		const uc = new ListDealsUseCase(
			{
				create: () =>
					({
						listScoped: async (filters: unknown) => {
							calls.push(filters);
							return { items: [], page: 1, limit: 20, total: 0, totalPages: 0 };
						},
					}) as never,
			} as never,
			{
				resolveCatalogScope: async () => ({
					kind: 'attendant',
					actorUserId: 'u1',
					readTeamIds: new Set(),
					readStoreIds: new Set(['s1']),
				}),
			} as never,
		);

		await uc.execute(
			{ userId: 'u1', role: 'ATTENDANT' },
			{ page: 1, limit: 20 },
		);
		assert.equal((calls[0] as { ownerUserId?: string }).ownerUserId, 'u1');
	});

	it('manager restricts to allowed stores when storeId omitted', async () => {
		let received: unknown = null;
		const uc = new ListDealsUseCase(
			{
				create: () =>
					({
						listScoped: async (filters: unknown) => {
							received = filters;
							return { items: [], page: 1, limit: 20, total: 0, totalPages: 0 };
						},
					}) as never,
			} as never,
			{
				resolveCatalogScope: async () => ({
					kind: 'manager',
					actorUserId: 'u2',
					readTeamIds: new Set(['t1']),
					mutateTeamIds: new Set(['t1']),
					readStoreIds: new Set(['s1', 's2']),
					mutateStoreIds: new Set(['s1']),
				}),
			} as never,
		);

		await uc.execute(
			{ userId: 'u2', role: 'MANAGER' },
			{ status: 'OPEN', page: 1, limit: 20 },
		);

		const r = received as { storeIds?: string[]; status?: string } | null;
		if (r === null) {
			throw new Error('expected listScoped to be called');
		}
		assert.deepEqual(r.storeIds?.sort(), ['s1', 's2']);
		assert.equal(r.status, 'OPEN');
	});

	it('general_manager rejects storeId outside scope', async () => {
		const uc = new ListDealsUseCase(
			{
				create: () =>
					({
						listScoped: async () => {
							throw new Error('should not be called');
						},
					}) as never,
			} as never,
			{
				resolveCatalogScope: async () => ({
					kind: 'general_manager',
					actorUserId: 'u3',
					readTeamIds: new Set(['t1']),
					readStoreIds: new Set(['s1']),
				}),
			} as never,
		);

		await assert.rejects(
			() =>
				uc.execute(
					{ userId: 'u3', role: 'GENERAL_MANAGER' },
					{ storeId: 's2', page: 1, limit: 20 },
				),
			LeadAccessDeniedError,
		);
	});

	it('admin can filter by ownerUserId', async () => {
		let received: unknown = null;
		const uc = new ListDealsUseCase(
			{
				create: () =>
					({
						listScoped: async (filters: unknown) => {
							received = filters;
							return { items: [], page: 1, limit: 20, total: 0, totalPages: 0 };
						},
					}) as never,
			} as never,
			{
				resolveCatalogScope: async () => ({ kind: 'full' }),
			} as never,
		);

		await uc.execute(
			{ userId: 'admin', role: 'ADMINISTRATOR' },
			{ ownerUserId: 'u9', page: 1, limit: 20 },
		);
		const r = received as { ownerUserId?: string } | null;
		assert.equal(r?.ownerUserId, 'u9');
	});
});
