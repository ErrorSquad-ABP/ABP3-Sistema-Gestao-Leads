import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { StorePrismaRepository } from './store-prisma.repository.js';

describe('StorePrismaRepository listMetrics', () => {
	it('aggregates store metrics with open deals counted by lead', async () => {
		const leadGroupByCalls: unknown[] = [];
		const dealFindManyCalls: unknown[] = [];
		const prisma = {
			store: {
				findMany: mock.fn(async () => [{ id: 'store-a' }, { id: 'store-b' }]),
			},
			lead: {
				groupBy: mock.fn(async (args: unknown) => {
					leadGroupByCalls.push(args);
					if (typeof args === 'object' && args !== null && 'where' in args) {
						return [{ storeId: 'store-a', _count: { _all: 1 } }];
					}
					return [
						{
							storeId: 'store-a',
							status: 'NEW',
							_count: { _all: 2 },
						},
						{
							storeId: 'store-a',
							status: 'CONVERTED',
							_count: { _all: 1 },
						},
					];
				}),
			},
			deal: {
				findMany: mock.fn(async (args: unknown) => {
					dealFindManyCalls.push(args);
					return [
						{
							value: { toString: () => '100.50' },
							lead: { storeId: 'store-a' },
						},
						{
							value: { toString: () => '50.25' },
							lead: { storeId: 'store-a' },
						},
					];
				}),
			},
		};
		const repository = new StorePrismaRepository(prisma as never);

		const metrics = await repository.listMetrics();

		assert.deepEqual(metrics, [
			{
				storeId: 'store-a',
				total: 3,
				converted: 1,
				openDeals: 1,
				conversionRate: 33,
				wonValue: 150.75,
			},
			{
				storeId: 'store-b',
				total: 0,
				converted: 0,
				openDeals: 0,
				conversionRate: 0,
				wonValue: 0,
			},
		]);
		assert.deepEqual(leadGroupByCalls[1], {
			by: ['storeId'],
			where: { deals: { some: { status: 'OPEN' } } },
			_count: { _all: true },
		});
		assert.deepEqual(dealFindManyCalls[0], {
			where: { status: 'WON' },
			select: {
				value: true,
				lead: { select: { storeId: true } },
			},
		});
	});
});
