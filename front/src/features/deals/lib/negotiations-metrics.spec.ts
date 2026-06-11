import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { DealsMetrics } from '../model/deals.model';
import { getNegotiationsTopMetrics } from './negotiations-metrics';

const metrics: DealsMetrics = {
	openDealsCount: 3,
	wonDealsCount: 2,
	lostDealsCount: 1,
	totalPipelineValue: 1280450,
	averageTicket: 50000,
	conversionRate: 2 / 3,
};

function normalizeSpaces(value: string): string {
	return value.replace(/\s/g, ' ');
}

describe('getNegotiationsTopMetrics', () => {
	it('formats real metrics from the aggregated endpoint contract', () => {
		const cards = getNegotiationsTopMetrics(metrics);

		assert.equal(cards.length, 5);
		assert.equal(cards[0]?.key, 'pipelineValue');
		assert.equal(normalizeSpaces(cards[0]?.value ?? ''), 'R$ 1.280.450');
		assert.equal(cards[1]?.value, '3');
		assert.equal(cards[2]?.value, '67%');
		assert.equal(cards[3]?.value, '2');
		assert.equal(normalizeSpaces(cards[4]?.value ?? ''), 'R$ 50.000');
	});

	it('does not show fake values while metrics are unavailable', () => {
		const cards = getNegotiationsTopMetrics(null);

		assert.equal(
			cards.every((card) => card.value === '--'),
			true,
		);
		assert.equal(
			cards.some((card) => card.description?.includes('último mês')),
			false,
		);
	});

	it('renders zero values honestly', () => {
		const cards = getNegotiationsTopMetrics({
			openDealsCount: 0,
			wonDealsCount: 0,
			lostDealsCount: 0,
			totalPipelineValue: 0,
			averageTicket: 0,
			conversionRate: 0,
		});

		assert.equal(normalizeSpaces(cards[0]?.value ?? ''), 'R$ 0');
		assert.equal(cards[1]?.value, '0');
		assert.equal(cards[2]?.value, '0%');
		assert.equal(cards[3]?.value, '0');
		assert.equal(normalizeSpaces(cards[4]?.value ?? ''), 'R$ 0');
	});
});
