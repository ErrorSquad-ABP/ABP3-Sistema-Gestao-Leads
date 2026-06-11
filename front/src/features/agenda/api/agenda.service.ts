import { apiFetch } from '@/lib/http/api-client';

import {
	parseAgendaItemResponse,
	parseAgendaItemsResponse,
	parseAgendaMetricsResponse,
} from '../schemas/agenda.schema';
import type {
	AgendaItemsQuery,
	CreateAgendaItemPayload,
	UpdateAgendaItemPayload,
} from '../model/agenda.model';

function toSearchParams(query: AgendaItemsQuery) {
	const params = new URLSearchParams();
	if (query.from) {
		params.set('from', query.from);
	}
	if (query.to) {
		params.set('to', query.to);
	}
	if (query.limit !== undefined) {
		params.set('limit', String(query.limit));
	}
	if (query.status) {
		params.set('status', query.status);
	}
	if (query.type) {
		params.set('type', query.type);
	}
	if (query.search?.trim()) {
		params.set('search', query.search.trim());
	}
	if (query.ownerUserId) {
		params.set('ownerUserId', query.ownerUserId);
	}
	return params;
}

async function getAgendaMetrics(signal?: AbortSignal) {
	const payload = await apiFetch<unknown>('/api/agenda/metrics', { signal });
	return parseAgendaMetricsResponse(payload);
}

async function getAgendaItems(
	query: AgendaItemsQuery = {},
	signal?: AbortSignal,
) {
	const params = toSearchParams(query);
	const suffix = params.size > 0 ? `?${params.toString()}` : '';
	const payload = await apiFetch<unknown>(`/api/agenda/items${suffix}`, {
		signal,
	});
	return parseAgendaItemsResponse(payload);
}

async function getLeadAgendaItems(leadId: string, signal?: AbortSignal) {
	const payload = await apiFetch<unknown>(`/api/leads/${leadId}/agenda-items`, {
		signal,
	});
	return parseAgendaItemsResponse(payload);
}

async function createAgendaItem(payload: CreateAgendaItemPayload) {
	const response = await apiFetch<unknown>('/api/agenda/items', {
		body: payload,
		method: 'POST',
	});
	return parseAgendaItemResponse(response);
}

async function updateAgendaItem(id: string, payload: UpdateAgendaItemPayload) {
	const response = await apiFetch<unknown>(`/api/agenda/items/${id}`, {
		body: payload,
		method: 'PATCH',
	});
	return parseAgendaItemResponse(response);
}

async function completeAgendaItem(id: string) {
	const response = await apiFetch<unknown>(`/api/agenda/items/${id}/done`, {
		method: 'PATCH',
	});
	return parseAgendaItemResponse(response);
}

async function cancelAgendaItem(id: string) {
	const response = await apiFetch<unknown>(`/api/agenda/items/${id}/cancel`, {
		method: 'PATCH',
	});
	return parseAgendaItemResponse(response);
}

async function deleteAgendaItem(id: string) {
	await apiFetch<unknown>(`/api/agenda/items/${id}`, {
		method: 'DELETE',
	});
}

export {
	cancelAgendaItem,
	completeAgendaItem,
	createAgendaItem,
	deleteAgendaItem,
	getAgendaMetrics,
	getAgendaItems,
	getLeadAgendaItems,
	updateAgendaItem,
};
