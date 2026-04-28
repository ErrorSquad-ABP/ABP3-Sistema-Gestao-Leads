import { apiFetch } from '@/lib/http/api-client';

import {
	parseVehicleResponse,
	parseVehiclesResponse,
} from '../schemas/vehicle.schema';
import type {
	CreateVehicleInput,
	UpdateVehicleInput,
} from '../model/vehicles.model';

type ListVehiclesFilters = {
	storeId?: string;
	status?: string;
	withoutOpenDeal?: boolean;
};

function vehiclesListQuery(filters: ListVehiclesFilters) {
	const params = new URLSearchParams();
	if (filters.storeId) {
		params.set('storeId', filters.storeId);
	}
	if (filters.status) {
		params.set('status', filters.status);
	}
	if (filters.withoutOpenDeal) {
		params.set('withoutOpenDeal', 'true');
	}
	return params.toString();
}

async function listVehicles(
	filters: ListVehiclesFilters,
	signal?: AbortSignal,
) {
	const query = vehiclesListQuery(filters);
	const raw = await apiFetch<unknown>(
		`/api/vehicles${query ? `?${query}` : ''}`,
		{
			signal,
		},
	);
	return parseVehiclesResponse(raw);
}

async function createVehicle(input: CreateVehicleInput) {
	const raw = await apiFetch<unknown>('/api/vehicles', {
		method: 'POST',
		body: input,
	});
	return parseVehicleResponse(raw);
}

async function updateVehicle(vehicleId: string, input: UpdateVehicleInput) {
	const raw = await apiFetch<unknown>(`/api/vehicles/${vehicleId}`, {
		method: 'PATCH',
		body: input,
	});
	return parseVehicleResponse(raw);
}

async function findVehicle(vehicleId: string, signal?: AbortSignal) {
	const raw = await apiFetch<unknown>(`/api/vehicles/${vehicleId}`, {
		signal,
	});
	return parseVehicleResponse(raw);
}

async function deactivateVehicle(vehicleId: string) {
	await apiFetch(`/api/vehicles/${vehicleId}`, {
		method: 'DELETE',
	});
}

export {
	createVehicle,
	deactivateVehicle,
	findVehicle,
	listVehicles,
	updateVehicle,
};
export type { ListVehiclesFilters };
