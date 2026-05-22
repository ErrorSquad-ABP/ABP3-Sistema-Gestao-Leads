import { apiFetch } from "@/lib/http/api-client"

import {
	parseVehicleCatalogResponse,
	parseVehicleResponse,
	parseVehiclesResponse,
} from "../schemas/vehicle.schema"
import type {
	CreateVehicleInput,
	UpdateVehicleInput,
	VehicleCatalogSort,
} from "../model/vehicles.model"

type ListVehiclesFilters = {
	storeId?: string
	status?: string
	withoutOpenDeal?: boolean
}

type VehicleCatalogFilters = {
	storeId?: string
	status?: string
	search?: string
	sort?: VehicleCatalogSort
	page: number
	limit: number
}

function vehiclesListQuery(filters: ListVehiclesFilters) {
	const params = new URLSearchParams()
	if (filters.storeId) {
		params.set("storeId", filters.storeId)
	}
	if (filters.status) {
		params.set("status", filters.status)
	}
	if (filters.withoutOpenDeal) {
		params.set("withoutOpenDeal", "true")
	}
	return params.toString()
}

function vehicleCatalogQuery(filters: VehicleCatalogFilters) {
	const params = new URLSearchParams()
	if (filters.storeId) {
		params.set("storeId", filters.storeId)
	}
	if (filters.status) {
		params.set("status", filters.status)
	}
	if (filters.search?.trim()) {
		params.set("search", filters.search.trim())
	}
	if (filters.sort) {
		params.set("sort", filters.sort)
	}
	params.set("page", String(filters.page))
	params.set("limit", String(filters.limit))
	return params.toString()
}

async function listVehicles(
	filters: ListVehiclesFilters,
	signal?: AbortSignal
) {
	const query = vehiclesListQuery(filters)
	const raw = await apiFetch<unknown>(
		`/api/vehicles${query ? `?${query}` : ""}`,
		{
			signal,
		}
	)
	return parseVehiclesResponse(raw)
}

async function listVehicleCatalog(
	filters: VehicleCatalogFilters,
	signal?: AbortSignal
) {
	const query = vehicleCatalogQuery(filters)
	const raw = await apiFetch<unknown>(`/api/vehicles/catalog?${query}`, {
		signal,
	})
	return parseVehicleCatalogResponse(raw)
}

async function createVehicle(input: CreateVehicleInput) {
	const raw = await apiFetch<unknown>("/api/vehicles", {
		method: "POST",
		body: input,
	})
	return parseVehicleResponse(raw)
}

async function updateVehicle(vehicleId: string, input: UpdateVehicleInput) {
	const raw = await apiFetch<unknown>(`/api/vehicles/${vehicleId}`, {
		method: "PATCH",
		body: input,
	})
	return parseVehicleResponse(raw)
}

async function findVehicle(vehicleId: string, signal?: AbortSignal) {
	const raw = await apiFetch<unknown>(`/api/vehicles/${vehicleId}`, {
		signal,
	})
	return parseVehicleResponse(raw)
}

async function deactivateVehicle(vehicleId: string) {
	await apiFetch(`/api/vehicles/${vehicleId}`, {
		method: "DELETE",
	})
}

async function deleteVehiclePermanently(vehicleId: string) {
	await apiFetch(`/api/vehicles/${vehicleId}/permanent`, {
		method: "DELETE",
	})
}

export {
	createVehicle,
	deactivateVehicle,
	deleteVehiclePermanently,
	findVehicle,
	listVehicleCatalog,
	listVehicles,
	updateVehicle,
}
export type { ListVehiclesFilters, VehicleCatalogFilters }
