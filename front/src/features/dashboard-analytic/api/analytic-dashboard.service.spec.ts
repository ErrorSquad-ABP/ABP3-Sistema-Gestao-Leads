import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	buildAnalyticDashboardQuery,
	normalizeAnalyticDashboardQuery,
} from './analytic-dashboard.service';

describe('normalizeAnalyticDashboardQuery', () => {
	it('keeps only start and end dates for custom mode', () => {
		assert.deepEqual(
			normalizeAnalyticDashboardQuery({
				mode: 'custom',
				referenceDate: '2026-04-28',
				startDate: '2026-04-01',
				endDate: '2026-04-28',
			}),
			{
				mode: 'custom',
				startDate: '2026-04-01',
				endDate: '2026-04-28',
			},
		);
	});

	it('keeps only referenceDate for non custom modes', () => {
		assert.deepEqual(
			normalizeAnalyticDashboardQuery({
				mode: 'month',
				referenceDate: '2026-04-28',
				startDate: '2026-04-01',
				endDate: '2026-04-28',
			}),
			{
				mode: 'month',
				referenceDate: '2026-04-28',
			},
		);
	});
});

describe('buildAnalyticDashboardQuery', () => {
	it('does not leak custom bounds into month requests', () => {
		assert.equal(
			buildAnalyticDashboardQuery({
				mode: 'month',
				referenceDate: '2026-04-28',
				startDate: '2026-04-01',
				endDate: '2026-04-28',
			}),
			'mode=month&referenceDate=2026-04-28',
		);
	});

	it('does not leak referenceDate into custom requests', () => {
		assert.equal(
			buildAnalyticDashboardQuery({
				mode: 'custom',
				referenceDate: '2026-04-28',
				startDate: '2026-04-01',
				endDate: '2026-04-28',
			}),
			'mode=custom&startDate=2026-04-01&endDate=2026-04-28',
		);
	});
});
