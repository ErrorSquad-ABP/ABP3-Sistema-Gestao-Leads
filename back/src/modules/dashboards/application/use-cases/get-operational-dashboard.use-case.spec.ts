import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BadRequestException } from '@nestjs/common';

import { GetOperationalDashboardUseCase } from './get-operational-dashboard.use-case.js';

const CURRENT_AGGREGATE = {
	totalLeads: 10,
	totalLeadsWithOpenDeal: 4,
	byStatus: [
		{ key: 'NEW', count: 5 },
		{ key: 'QUALIFIED', count: 1 },
		{ key: 'CONVERTED', count: 2 },
	],
	bySource: [{ key: 'whatsapp', count: 6 }],
	byStore: [
		{
			storeId: '7fe1b7fa-b312-4ba3-9a72-6ddf5fb07172',
			storeName: 'Loja Matriz',
			count: 10,
		},
	],
	byImportance: [{ key: 'HOT', count: 3 }],
};

const PREVIOUS_AGGREGATE = {
	totalLeads: 4,
	totalLeadsWithOpenDeal: 2,
	byStatus: [
		{ key: 'NEW', count: 2 },
		{ key: 'CONVERTED', count: 1 },
	],
	bySource: [{ key: 'whatsapp', count: 4 }],
	byStore: [
		{
			storeId: '7fe1b7fa-b312-4ba3-9a72-6ddf5fb07172',
			storeName: 'Loja Matriz',
			count: 4,
		},
	],
	byImportance: [{ key: 'HOT', count: 2 }],
};

function makeUseCase(scope: unknown = { kind: 'full' }) {
	const calls: {
		periods: { startDate: Date; endDate: Date }[];
		scope?: unknown;
	} = { periods: [] };
	const useCase = new GetOperationalDashboardUseCase(
		{ resolveCatalogScope: async () => scope } as never,
		{
			create: () =>
				({
					getOperationalAggregate: async (input: {
						period: { startDate: Date; endDate: Date };
						scope: unknown;
					}) => {
						calls.periods.push(input.period);
						calls.scope = input.scope;
						if (
							input.period.endDate.toISOString() === '2026-04-01T00:00:00.000Z'
						) {
							return PREVIOUS_AGGREGATE;
						}
						return CURRENT_AGGREGATE;
					},
					getOperationalTrend: async () => [
						{
							date: '2026-04-01',
							activeLeads: 2,
							convertedLeads: 1,
							totalLeads: 4,
						},
						{
							date: '2026-04-02',
							activeLeads: 4,
							convertedLeads: 1,
							totalLeads: 6,
						},
					],
				}) as never,
		} as never,
	);

	return { calls, useCase };
}

describe('GetOperationalDashboardUseCase', () => {
	it('uses the default 30-day period when no dates are provided', async () => {
		const { calls, useCase } = makeUseCase();

		const result = await useCase.execute(
			{ userId: 'admin', role: 'ADMINISTRATOR' },
			{},
		);

		assert.equal(result.period.days, 30);
		assert.equal(calls.periods.length, 2);
		assert.equal(result.totals.totalLeads, 10);
	});

	it('rejects partial date filters', async () => {
		const { useCase } = makeUseCase();

		await assert.rejects(
			() =>
				useCase.execute(
					{ userId: 'manager', role: 'MANAGER' },
					{ startDate: '2026-01-01T00:00:00.000Z' },
				),
			(error: unknown) => error instanceof BadRequestException,
		);
	});

	it('rejects inverted date ranges', async () => {
		const { useCase } = makeUseCase();

		await assert.rejects(
			() =>
				useCase.execute(
					{ userId: 'manager', role: 'MANAGER' },
					{
						startDate: '2026-05-01T00:00:00.000Z',
						endDate: '2026-05-01T00:00:00.000Z',
					},
				),
			(error: unknown) => error instanceof BadRequestException,
		);
	});

	it('blocks non-admin users from querying more than one year', async () => {
		const { useCase } = makeUseCase({
			kind: 'manager',
			readStoreIds: ['7fe1b7fa-b312-4ba3-9a72-6ddf5fb07172'],
		});

		await assert.rejects(
			() =>
				useCase.execute(
					{ userId: 'manager', role: 'MANAGER' },
					{
						startDate: '2025-01-01T00:00:00.000Z',
						endDate: '2026-02-01T00:00:00.000Z',
					},
				),
			(error: unknown) => error instanceof BadRequestException,
		);
	});

	it('allows administrators to query more than one year', async () => {
		const { calls, useCase } = makeUseCase();

		const result = await useCase.execute(
			{ userId: 'admin', role: 'ADMINISTRATOR' },
			{
				startDate: '2024-01-01T00:00:00.000Z',
				endDate: '2026-01-01T00:00:00.000Z',
			},
		);

		assert.equal(result.scope.role, 'ADMINISTRATOR');
		assert.equal(calls.periods.length, 2);
		assert.equal(result.period.days, 731);
	});

	it('returns RF04 distributions with percentages', async () => {
		const { useCase } = makeUseCase();

		const result = await useCase.execute(
			{ userId: 'admin', role: 'ADMINISTRATOR' },
			{
				startDate: '2026-04-01T00:00:00.000Z',
				endDate: '2026-05-01T00:00:00.000Z',
			},
		);

		assert.equal(result.distributions.byStatus[0]?.key, 'NEW');
		assert.equal(result.distributions.byStatus[0]?.percentage, 50);
		assert.equal(result.distributions.bySource[0]?.key, 'store-visit');
		assert.equal(result.distributions.byStore[0]?.percentage, 100);
		assert.equal(result.distributions.byImportance[2]?.key, 'HOT');
		assert.equal(result.distributions.byImportance[2]?.percentage, 75);
	});

	it('returns real temporal KPIs compared with the previous period', async () => {
		const { useCase } = makeUseCase();

		const result = await useCase.execute(
			{ userId: 'admin', role: 'ADMINISTRATOR' },
			{
				startDate: '2026-04-01T00:00:00.000Z',
				endDate: '2026-05-01T00:00:00.000Z',
			},
		);

		assert.equal(result.kpis.totalLeads.value, 10);
		assert.equal(result.kpis.totalLeads.previousValue, 4);
		assert.equal(result.kpis.totalLeads.delta, 6);
		assert.equal(result.kpis.totalLeads.deltaPercentage, 150);
		assert.equal(result.kpis.activeLeads.value, 6);
		assert.equal(result.kpis.convertedLeads.value, 2);
		assert.equal(result.kpis.conversionRate.value, 20);
		assert.equal(result.kpis.conversionRate.previousValue, 25);
		assert.equal(result.kpis.conversionRate.deltaPoints, -5);
	});

	it('returns daily trend points with conversion rate', async () => {
		const { useCase } = makeUseCase();

		const result = await useCase.execute(
			{ userId: 'admin', role: 'ADMINISTRATOR' },
			{
				startDate: '2026-04-01T00:00:00.000Z',
				endDate: '2026-05-01T00:00:00.000Z',
			},
		);

		assert.equal(result.trend.points.length, 2);
		assert.equal(result.trend.points[0]?.conversionRate, 25);
		assert.equal(result.trend.points[1]?.conversionRate, 16.67);
	});
});
