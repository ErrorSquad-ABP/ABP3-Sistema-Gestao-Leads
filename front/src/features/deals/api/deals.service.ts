import { apiFetch } from '@/lib/http/api-client';

import {
	parseDealsByLeadListResponse,
	parseDealsPagedResponse,
} from '../schemas/deal-list.schema';
import {
	parseDealHistoryResponse,
	parseDealResponse,
} from '../schemas/deal.schema';
import type { DealCreateInput, DealUpdateInput } from '../model/deals.model';

type ListDealsQuery = {
	storeId?: string;
	ownerUserId?: string;
	status?: 'OPEN' | 'WON' | 'LOST';
	page: number;
	limit: number;
};

function dealsListQuery(query: ListDealsQuery) {
	const params = new URLSearchParams({
		page: String(query.page),
		limit: String(query.limit),
	});
	if (query.storeId) {
		params.set('storeId', query.storeId);
	}
	if (query.ownerUserId) {
		params.set('ownerUserId', query.ownerUserId);
	}
	if (query.status) {
		params.set('status', query.status);
	}
	return params.toString();
}

async function listDealsPaged(query: ListDealsQuery, signal?: AbortSignal) {
	const raw = await apiFetch<unknown>(`/api/deals?${dealsListQuery(query)}`, {
		signal,
	});
	return parseDealsPagedResponse(raw);
}

async function listDealsByLead(leadId: string, signal?: AbortSignal) {
	const raw = await apiFetch<unknown>(`/api/leads/${leadId}/deals`, { signal });
	return parseDealsByLeadListResponse(raw);
}

async function createDealForLead(leadId: string, input: DealCreateInput) {
	const raw = await apiFetch<unknown>(`/api/leads/${leadId}/deals`, {
		method: 'POST',
		body: {
			vehicleId: input.vehicleId,
			title: input.title,
			value: input.value,
			importance: input.importance,
			stage: input.stage,
		},
	});
	return parseDealResponse(raw);
}

async function findDeal(dealId: string, signal?: AbortSignal) {
	const raw = await apiFetch<unknown>(`/api/deals/${dealId}`, { signal });
	return parseDealResponse(raw);
}

async function listDealHistory(dealId: string, signal?: AbortSignal) {
	const raw = await apiFetch<unknown>(`/api/deals/${dealId}/history`, {
		signal,
	});
	return parseDealHistoryResponse(raw);
}

async function updateDeal(dealId: string, input: DealUpdateInput) {
	const raw = await apiFetch<unknown>(`/api/deals/${dealId}`, {
		method: 'PATCH',
		body: input,
	});
	return parseDealResponse(raw);
}

async function deleteDeal(dealId: string) {
	await apiFetch(`/api/deals/${dealId}`, { method: 'DELETE' });
}

export {
	createDealForLead,
	deleteDeal,
	findDeal,
	listDealHistory,
	listDealsByLead,
	listDealsPaged,
	updateDeal,
};
export type { ListDealsQuery };
