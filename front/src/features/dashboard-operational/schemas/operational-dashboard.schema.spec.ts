import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { ApiError } from "@/lib/http/api-error"

import { parseOperationalDashboardResponse } from "./operational-dashboard.schema"

const STORE_ID = "550e8400-e29b-41d4-a716-446655440000"

describe("parseOperationalDashboardResponse", () => {
	it("parses the RF04 operational dashboard contract", () => {
		const parsed = parseOperationalDashboardResponse({
			distributions: {
				byImportance: [{ count: 2, key: "HOT", percentage: 100 }],
				bySource: [{ count: 2, key: "whatsapp", percentage: 100 }],
				byStatus: [{ count: 2, key: "NEW", percentage: 100 }],
				byStore: [
					{
						count: 2,
						percentage: 100,
						storeId: STORE_ID,
						storeName: "Loja Matriz",
					},
				],
			},
			period: {
				days: 30,
				endDate: "2026-05-20T00:00:00.000Z",
				startDate: "2026-04-20T00:00:00.000Z",
			},
			kpis: {
				activeLeads: {
					delta: 1,
					deltaPercentage: 100,
					deltaPoints: null,
					previousValue: 1,
					value: 2,
				},
				conversionRate: {
					delta: 50,
					deltaPercentage: null,
					deltaPoints: 50,
					previousValue: 50,
					value: 100,
				},
				convertedLeads: {
					delta: 1,
					deltaPercentage: 100,
					deltaPoints: null,
					previousValue: 1,
					value: 2,
				},
				totalLeads: {
					delta: 1,
					deltaPercentage: 100,
					deltaPoints: null,
					previousValue: 1,
					value: 2,
				},
			},
			scope: {
				role: "ADMINISTRATOR",
				storeIds: null,
			},
			totals: {
				totalLeads: 2,
				totalLeadsWithOpenDeal: 2,
			},
			trend: {
				points: [
					{
						activeLeads: 1,
						conversionRate: 50,
						convertedLeads: 1,
						date: "2026-05-19",
						totalLeads: 2,
					},
				],
			},
		})

		assert.equal(parsed.totals.totalLeads, 2)
		assert.equal(parsed.kpis.conversionRate.deltaPoints, 50)
		assert.equal(parsed.distributions.byStore[0]?.storeName, "Loja Matriz")
	})

	it("rejects malformed responses", () => {
		assert.throws(
			() =>
				parseOperationalDashboardResponse({
					distributions: {},
					period: {},
					scope: {},
					totals: {},
				}),
			ApiError
		)
	})
})
