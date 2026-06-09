import { z } from "zod"

import { ApiError } from "@/lib/http/api-error"

const vehicleStatuses = ["AVAILABLE", "RESERVED", "SOLD", "INACTIVE"] as const

const supportedFuelTypes = [
	"GASOLINE",
	"ETHANOL",
	"FLEX",
	"DIESEL",
	"ELECTRIC",
	"HYBRID",
	"PLUG_IN_HYBRID",
	"CNG",
] as const

const vehicleSchema = z.object({
	id: z.string().uuid(),
	storeId: z.string().uuid(),
	brand: z.string(),
	model: z.string(),
	version: z.string().nullable(),
	modelYear: z.number().int(),
	manufactureYear: z.number().int().nullable(),
	color: z.string().nullable(),
	mileage: z.number().int(),
	supportedFuelType: z.enum(supportedFuelTypes),
	price: z.string(),
	status: z.enum(vehicleStatuses),
	plate: z.string().nullable(),
	vin: z.string().nullable(),
	imageUrl: z.string().nullable().optional(),
	imageAlt: z.string().nullable().optional(),
	imageProvider: z.string().nullable().optional(),
	imageProviderPhotoId: z.string().nullable().optional(),
	imagePhotographerName: z.string().nullable().optional(),
	imagePhotographerUrl: z.string().nullable().optional(),
	imageSourceUrl: z.string().nullable().optional(),
	imageResolvedAt: z.coerce.date().nullable().optional(),
	imageExpiresAt: z.coerce.date().nullable().optional(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
})

const vehicleCatalogSorts = [
	"recent",
	"price_asc",
	"price_desc",
	"mileage_asc",
	"mileage_desc",
	"interest_desc",
] as const

const vehiclePriceComparisons = [
	"ABOVE_AVERAGE",
	"BELOW_AVERAGE",
	"AT_AVERAGE",
] as const

const vehicleCatalogItemSchema = z.object({
	vehicle: vehicleSchema,
	storeName: z.string(),
	dealCount: z.number().int(),
	interests: z.array(
		z.object({
			leadId: z.string().uuid(),
			dealId: z.string().uuid(),
			customerName: z.string(),
			dealTitle: z.string(),
			dealStage: z.string(),
			dealStatus: z.string(),
			createdAt: z.coerce.date(),
		})
	),
	daysInStock: z.number().int(),
	priceComparison: z.enum(vehiclePriceComparisons).nullable(),
})

const vehicleCatalogSchema = z.object({
	items: z.array(vehicleCatalogItemSchema),
	summary: z.object({
		total: z.number().int(),
		available: z.number().int(),
		reserved: z.number().int(),
		sold: z.number().int(),
		inactive: z.number().int(),
		highInterest: z.number().int(),
	}),
	page: z.number().int(),
	limit: z.number().int(),
	total: z.number().int(),
	totalPages: z.number().int(),
})

function parseVehicleResponse(data: unknown) {
	const parsed = vehicleSchema.safeParse(data)
	if (!parsed.success) {
		throw new ApiError("Resposta da API em formato inesperado.", 502, {
			code: "vehicles.invalid_response_shape",
		})
	}
	return parsed.data
}

function parseVehiclesResponse(data: unknown) {
	const parsed = z.array(vehicleSchema).safeParse(data)
	if (!parsed.success) {
		throw new ApiError("Resposta da API em formato inesperado.", 502, {
			code: "vehicles.invalid_list_response_shape",
		})
	}
	return parsed.data
}

function parseVehicleCatalogResponse(data: unknown) {
	const parsed = vehicleCatalogSchema.safeParse(data)
	if (!parsed.success) {
		throw new ApiError("Resposta da API em formato inesperado.", 502, {
			code: "vehicles.invalid_catalog_response_shape",
		})
	}
	return parsed.data
}

export {
	parseVehicleCatalogResponse,
	parseVehicleResponse,
	parseVehiclesResponse,
	supportedFuelTypes,
	vehicleCatalogSchema,
	vehicleCatalogSorts,
	vehiclePriceComparisons,
	vehicleSchema,
	vehicleStatuses,
}
