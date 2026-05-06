import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '@/lib/http/api-error';

import { parseAnalyticDashboardResponse } from './analytic-dashboard.schema';

describe('parseAnalyticDashboardResponse', () => {
	it('accepts a realistic analytic dashboard payload', () => {
		const parsed = parseAnalyticDashboardResponse({
			filter: {
				mode: 'month',
				startDate: '2026-04-01',
				endDate: '2026-04-30',
				scope: 'manager',
				top: 6,
			},
			summary: {
				totalLeads: 20,
				convertedLeads: 7,
				notConvertedLeads: 13,
				conversionRate: 35,
			},
			byAttendant: [
				{
					id: 'att-1',
					name: 'Andre',
					totalLeads: 10,
					convertedLeads: 4,
					notConvertedLeads: 6,
					conversionRate: 40,
					openDeals: 3,
					wonDeals: 4,
					lostDeals: 3,
				},
			],
			byTeam: [
				{
					id: 'team-1',
					name: 'Equipe Centro',
					totalLeads: 20,
					convertedLeads: 7,
					notConvertedLeads: 13,
					conversionRate: 35,
					openDeals: 5,
					wonDeals: 7,
					lostDeals: 8,
				},
			],
			importanceDistribution: [
				{ key: 'HOT', label: 'Quente', count: 8 },
				{ key: 'WARM', label: 'Morno', count: 7 },
			],
			finalizationReasons: [
				{ key: 'sale_completed', label: 'Venda concluida', count: 7 },
			],
			averageTimeToFirstInteraction: {
				hours: 14.5,
				leadsWithInteraction: 18,
				isApproximate: true,
				methodology: 'Aproximacao operacional.',
			},
		});

		assert.equal(parsed.summary.totalLeads, 20);
		assert.equal(parsed.filter.scope, 'manager');
		assert.equal(parsed.byAttendant[0]?.name, 'Andre');
	});

	it('rejects malformed dashboard payload', () => {
		assert.throws(
			() =>
				parseAnalyticDashboardResponse({
					filter: {
						mode: 'month',
						startDate: '2026-04-01',
						endDate: '2026-04-30',
						scope: 'manager',
						top: null,
					},
					summary: {
						totalLeads: '20',
						convertedLeads: 7,
						notConvertedLeads: 13,
						conversionRate: 35,
					},
					byAttendant: [],
					byTeam: [],
					importanceDistribution: [],
					finalizationReasons: [],
					averageTimeToFirstInteraction: {
						hours: null,
						leadsWithInteraction: 0,
						isApproximate: true,
						methodology: 'Aproximacao operacional.',
					},
				}),
			(error: unknown) =>
				error instanceof ApiError &&
				error.code === 'analytic-dashboard.invalid_response_shape',
		);
	});
});
