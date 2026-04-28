import { apiFetch } from '@/lib/http/api-client';

import {
	parseDealPipelineResponse,
	parseDealPipelineStageResponse,
	parseDealsByLeadListResponse,
	parseDealsPagedResponse,
} from '../schemas/deal-list.schema';
import {
	parseDealHistoryResponse,
	parseDealResponse,
} from '../schemas/deal.schema';
import type {
	DealCreateInput,
	DealPipelineQuery,
	DealPipelineStageQuery,
	DealUpdateInput,
} from '../model/deals.model';

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

function dealsPipelineQuery(
	query: DealPipelineQuery | Omit<DealPipelineStageQuery, 'stage'>,
) {
	const params = new URLSearchParams({
		pageSize: String(query.pageSize),
	});
	if ('page' in query) {
		params.set('page', String(query.page));
	}
	if (query.status) {
		params.set('status', query.status);
	}
	if (query.importance) {
		params.set('importance', query.importance);
	}
	const search = query.search?.trim();
	if (search) {
		params.set('search', search);
	}
	return params.toString();
}

async function listDealsPaged(query: ListDealsQuery, signal?: AbortSignal) {
	const raw = await apiFetch<unknown>(`/api/deals?${dealsListQuery(query)}`, {
		signal,
	});
	return parseDealsPagedResponse(raw);
}

async function getDealsPipeline(
	query: DealPipelineQuery,
	signal?: AbortSignal,
) {
	const raw = await apiFetch<unknown>(
		`/api/deals/pipeline?${dealsPipelineQuery(query)}`,
		{ signal },
	);
	return parseDealPipelineResponse(raw);
}

async function getDealsPipelineStage(
	query: DealPipelineStageQuery,
	signal?: AbortSignal,
) {
	const { stage, ...params } = query;
	const raw = await apiFetch<unknown>(
		`/api/deals/pipeline/stages/${stage}?${dealsPipelineQuery(params)}`,
		{ signal },
	);
	return parseDealPipelineStageResponse(raw);
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
	getDealsPipeline,
	getDealsPipelineStage,
	listDealHistory,
	listDealsByLead,
	listDealsPaged,
	updateDeal,
};
export type { ListDealsQuery };
