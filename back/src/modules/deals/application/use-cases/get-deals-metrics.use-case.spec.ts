import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GetDealsMetricsUseCase } from './get-deals-metrics.use-case.js';

const EMPTY_METRICS = {
	openDealsCount: 0,
	wonDealsCount: 0,
	lostDealsCount: 0,
	totalPipelineValue: 0,
	averageTicket: 0,
	conversionRate: 0,
};

describe('GetDealsMetricsUseCase', () => {
	it('uses the full scope for administrators', async () => {
		let received: unknown = null;
		const uc = new GetDealsMetricsUseCase(
			{
				create: () => ({
					metricsScoped: async (filters: unknown) => {
						received = filters;
						return EMPTY_METRICS;
					},
				}),
			} as never,
			{
				resolveCatalogScope: async () => ({ kind: 'full' }),
			} as never,
		);

		await uc.execute({ userId: 'admin', role: 'ADMINISTRATOR' });

		assert.deepEqual(received, {});
	});

	it('forces attendants to their own deals', async () => {
		let received: unknown = null;
		const uc = new GetDealsMetricsUseCase(
			{
				create: () => ({
					metricsScoped: async (filters: unknown) => {
						received = filters;
						return EMPTY_METRICS;
					},
				}),
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

		await uc.execute({ userId: 'u1', role: 'ATTENDANT' });

		assert.deepEqual(received, { ownerUserId: 'u1' });
	});

	it('restricts managers and general managers to readable stores', async () => {
		let received: unknown = null;
		const uc = new GetDealsMetricsUseCase(
			{
				create: () => ({
					metricsScoped: async (filters: unknown) => {
						received = filters;
						return EMPTY_METRICS;
					},
				}),
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

		await uc.execute({ userId: 'u2', role: 'MANAGER' });

		assert.deepEqual((received as { storeIds: string[] }).storeIds.toSorted(), [
			's1',
			's2',
		]);
	});

	it('returns repository metrics unchanged', async () => {
		const expected = {
			openDealsCount: 4,
			wonDealsCount: 2,
			lostDealsCount: 1,
			totalPipelineValue: 150000,
			averageTicket: 75000,
			conversionRate: 2 / 3,
		};
		const uc = new GetDealsMetricsUseCase(
			{
				create: () => ({
					metricsScoped: async () => expected,
				}),
			} as never,
			{
				resolveCatalogScope: async () => ({ kind: 'full' }),
			} as never,
		);

		assert.deepEqual(
			await uc.execute({ userId: 'admin', role: 'ADMINISTRATOR' }),
			expected,
		);
	});
});
