import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GetAnalyticDashboardUseCase } from './get-analytic-dashboard.use-case.js';

describe('GetAnalyticDashboardUseCase', () => {
	it('combines resolved time range, scope and repository payload', async () => {
		const calls: {
			scope?: unknown;
			timeRange?: unknown;
		} = {};

		const useCase = new GetAnalyticDashboardUseCase(
			{
				create: () =>
					({
						getAnalyticDashboard: async (
							scope: unknown,
							timeRange: unknown,
						) => {
							calls.scope = scope;
							calls.timeRange = timeRange;
							return {
								summary: {
									totalLeads: 10,
									convertedLeads: 4,
									notConvertedLeads: 6,
									conversionRate: 40,
								},
								byAttendant: [],
								byTeam: [],
								importanceDistribution: [],
								finalizationReasons: [],
								averageTimeToFirstInteraction: {
									hours: 8.5,
									leadsWithInteraction: 9,
								},
							};
						},
					}) as never,
			} as never,
			{
				resolve: async () => ({
					kind: 'manager',
					actorUserId: 'user-1',
					readTeamIds: ['team-1'],
					readStoreIds: ['store-1'],
				}),
			} as never,
			{
				resolve: () => ({
					mode: 'month',
					startDate: '2026-04-01',
					endDate: '2026-04-30',
					startAt: new Date('2026-04-01T00:00:00.000Z'),
					endExclusive: new Date('2026-05-01T00:00:00.000Z'),
				}),
			} as never,
		);

		const result = await useCase.execute(
			{ userId: 'user-1', role: 'MANAGER' },
			{ mode: 'month', referenceDate: '2026-04-25' },
		);

		assert.deepEqual(calls.scope, {
			kind: 'manager',
			actorUserId: 'user-1',
			readTeamIds: ['team-1'],
			readStoreIds: ['store-1'],
		});
		assert.deepEqual(calls.timeRange, {
			mode: 'month',
			startDate: '2026-04-01',
			endDate: '2026-04-30',
			startAt: new Date('2026-04-01T00:00:00.000Z'),
			endExclusive: new Date('2026-05-01T00:00:00.000Z'),
		});
		assert.deepEqual(result.filter, {
			mode: 'month',
			startDate: '2026-04-01',
			endDate: '2026-04-30',
			scope: 'manager',
		});
		assert.equal(result.summary.conversionRate, 40);
	});

	it('preserves full scope for administrators', async () => {
		const useCase = new GetAnalyticDashboardUseCase(
			{
				create: () =>
					({
						getAnalyticDashboard: async (scope: unknown) => {
							assert.deepEqual(scope, { kind: 'full' });
							return {
								summary: {
									totalLeads: 0,
									convertedLeads: 0,
									notConvertedLeads: 0,
									conversionRate: 0,
								},
								byAttendant: [],
								byTeam: [],
								importanceDistribution: [],
								finalizationReasons: [],
								averageTimeToFirstInteraction: {
									hours: null,
									leadsWithInteraction: 0,
								},
							};
						},
					}) as never,
			} as never,
			{ resolve: async () => ({ kind: 'full' }) } as never,
			{
				resolve: () => ({
					mode: 'year',
					startDate: '2026-01-01',
					endDate: '2026-12-31',
					startAt: new Date('2026-01-01T00:00:00.000Z'),
					endExclusive: new Date('2027-01-01T00:00:00.000Z'),
				}),
			} as never,
		);

		const result = await useCase.execute(
			{ userId: 'admin', role: 'ADMINISTRATOR' },
			{ mode: 'year', referenceDate: '2026-04-25' },
		);

		assert.equal(result.filter.scope, 'full');
		assert.equal(result.filter.mode, 'year');
	});
});
