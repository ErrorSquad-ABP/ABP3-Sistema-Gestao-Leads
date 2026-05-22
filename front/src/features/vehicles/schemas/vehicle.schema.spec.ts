import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { ApiError } from "@/lib/http/api-error"

import {
	formatDaysInStock,
	formatVehiclePriceComparison,
} from "../lib/vehicle-formatters"
import { parseVehicleCatalogResponse } from "./vehicle.schema"

const vehicle = {
	id: "11111111-1111-4111-8111-111111111111",
	storeId: "22222222-2222-4222-8222-222222222222",
	brand: "Toyota",
	model: "Corolla Cross",
	version: "XRE 2.0 16V Flex",
	modelYear: 2024,
	manufactureYear: 2024,
	color: "Preto",
	mileage: 24532,
	supportedFuelType: "FLEX",
	price: "129900.00",
	status: "AVAILABLE",
	plate: "PLQ1A23",
	vin: null,
	imageUrl: "https://carimagesapi.com/image?make=Toyota&model=Corolla",
	imageAlt: "Toyota Corolla Cross",
	imageProvider: "carimages",
	imageProviderPhotoId: null,
	imagePhotographerName: null,
	imagePhotographerUrl: null,
	imageSourceUrl: "https://carimagesapi.com/",
	imageResolvedAt: "2026-05-06T10:00:00.000Z",
	createdAt: "2026-05-01T10:00:00.000Z",
	updatedAt: "2026-05-06T10:00:00.000Z",
}

describe("vehicle catalog schema", () => {
	it("parses enriched catalog responses", () => {
		const parsed = parseVehicleCatalogResponse({
			items: [
				{
					vehicle,
					storeName: "Loja Matriz",
					dealCount: 3,
					interests: [
						{
							leadId: "33333333-3333-4333-8333-333333333333",
							dealId: "44444444-4444-4444-8444-444444444444",
							customerName: "Cliente Teste",
							dealTitle: "Interesse Corolla Cross",
							dealStage: "CLOSING",
							dealStatus: "OPEN",
							createdAt: "2026-05-06T11:00:00.000Z",
						},
					],
					daysInStock: 5,
					priceComparison: "ABOVE_AVERAGE",
				},
			],
			summary: {
				total: 1,
				available: 1,
				reserved: 0,
				sold: 0,
				inactive: 0,
				highInterest: 1,
			},
			page: 1,
			limit: 8,
			total: 1,
			totalPages: 1,
		})

		assert.equal(parsed.items[0]?.vehicle.imageProvider, "carimages")
		assert.equal(parsed.items[0]?.storeName, "Loja Matriz")
		assert.equal(parsed.items[0]?.interests[0]?.customerName, "Cliente Teste")
		assert.equal(parsed.summary.highInterest, 1)
	})

	it("rejects invalid catalog responses", () => {
		assert.throws(() => parseVehicleCatalogResponse({ items: null }), ApiError)
	})
})

describe("vehicle catalog formatters", () => {
	it("formats stock age and price comparison labels", () => {
		assert.equal(formatDaysInStock(0), "Hoje")
		assert.equal(formatDaysInStock(1), "1 dia")
		assert.equal(formatDaysInStock(12), "12 dias")
		assert.equal(
			formatVehiclePriceComparison("ABOVE_AVERAGE"),
			"acima da média"
		)
		assert.equal(formatVehiclePriceComparison(null), "sem comparação")
	})
})
