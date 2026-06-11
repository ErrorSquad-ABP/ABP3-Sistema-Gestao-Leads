import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DealPrismaRepository } from './deal-prisma.repository.js';

function decimal(value: number) {
	return { toString: () => String(value) };
}

describe('DealPrismaRepository.metricsScoped', () => {
	it('aggregates deal metrics by status within the received scope', async () => {
		const whereStatuses: string[] = [];
		const repo = new DealPrismaRepository({
			deal: {
				aggregate: async ({ where }: { where: { status: string } }) => {
					whereStatuses.push(where.status);
					if (where.status === 'OPEN') {
						return { _sum: { value: decimal(125000) } };
					}
					return { _avg: { value: decimal(50000) } };
				},
				count: async ({ where }: { where: { status: string } }) => {
					whereStatuses.push(where.status);
					if (where.status === 'OPEN') return 3;
					if (where.status === 'WON') return 2;
					if (where.status === 'LOST') return 1;
					return 0;
				},
			},
		} as never);

		const metrics = await repo.metricsScoped({ storeIds: ['store-1'] });

		assert.equal(metrics.openDealsCount, 3);
		assert.equal(metrics.wonDealsCount, 2);
		assert.equal(metrics.lostDealsCount, 1);
		assert.equal(metrics.totalPipelineValue, 125000);
		assert.equal(metrics.averageTicket, 50000);
		assert.equal(metrics.conversionRate, 2 / 3);
		assert.deepEqual(whereStatuses.sort(), [
			'LOST',
			'OPEN',
			'OPEN',
			'WON',
			'WON',
		]);
	});

	it('returns zero for average ticket and conversion rate without won or lost deals', async () => {
		const repo = new DealPrismaRepository({
			deal: {
				aggregate: async ({ where }: { where: { status: string } }) =>
					where.status === 'OPEN'
						? { _sum: { value: null } }
						: { _avg: { value: decimal(99999) } },
				count: async () => 0,
			},
		} as never);

		const metrics = await repo.metricsScoped({ ownerUserId: 'user-1' });

		assert.equal(metrics.openDealsCount, 0);
		assert.equal(metrics.wonDealsCount, 0);
		assert.equal(metrics.lostDealsCount, 0);
		assert.equal(metrics.totalPipelineValue, 0);
		assert.equal(metrics.averageTicket, 0);
		assert.equal(metrics.conversionRate, 0);
	});
});
