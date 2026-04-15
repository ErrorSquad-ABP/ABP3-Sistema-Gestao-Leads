import { apiFetch } from '@/lib/http/api-client';

import { LEADS_PAGE_LIMIT } from '../lib/leads-pagination';
import {
	leadListItemSchema,
	parseLeadListPagedResponse,
} from '../schemas/lead-list.schema';
import {
	parseLeadCustomerResponse,
	parseLeadCustomersResponse,
	parseLeadOwnersResponse,
	parseLeadStoreResponse,
	parseLeadStoresResponse,
} from '../schemas/lead-support.schema';
import type {
	CreateLeadInput,
	LeadCustomer,
	LeadListItem,
	LeadOwnerRecord,
	LeadStore,
	ReassignLeadInput,
	UpdateLeadInput,
} from '../types/leads.types';

function leadsListQuery(page: number): string {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(LEADS_PAGE_LIMIT),
	});
	return params.toString();
}

/**
 * Lista leads cujo `ownerUserId` corresponde ao utilizador indicado.
 * Regra de UI: tipicamente `ATTENDANT` com o próprio `user.id`.
 * O servidor rejeita `ownerUserId` diferente do utilizador autenticado (`403`).
 */
async function fetchLeadsByOwner(
	ownerUserId: string,
	page: number,
	signal?: AbortSignal,
) {
	const raw = await apiFetch<unknown>(
		`/api/leads/owner/${ownerUserId}?${leadsListQuery(page)}`,
		{
			signal,
		},
	);
	return parseLeadListPagedResponse(raw);
}

/**
 * Lista leads do escopo do gestor (`GET /api/leads/manager`).
 */
async function fetchLeadsManager(page: number, signal?: AbortSignal) {
	const raw = await apiFetch<unknown>(
		`/api/leads/manager?${leadsListQuery(page)}`,
		{
			signal,
		},
	);
	return parseLeadListPagedResponse(raw);
}

/**
 * Lista leads associados à equipa.
 * O servidor aplica `LeadAccessPolicy` (equipas membro/gestor; papéis globais podem ler qualquer `teamId`).
 */
async function fetchLeadsByTeam(
	teamId: string,
	page: number,
	signal?: AbortSignal,
) {
	const raw = await apiFetch<unknown>(
		`/api/leads/team/${teamId}?${leadsListQuery(page)}`,
		{
			signal,
		},
	);
	return parseLeadListPagedResponse(raw);
}

/**
 * Lista todos os leads (`GET /api/leads/all`). Reservado a `ADMINISTRATOR` e `GENERAL_MANAGER` no servidor.
 */
async function fetchLeadsAll(page: number, signal?: AbortSignal) {
	const raw = await apiFetch<unknown>(
		`/api/leads/all?${leadsListQuery(page)}`,
		{
			signal,
		},
	);
	return parseLeadListPagedResponse(raw);
}

async function createLead(input: CreateLeadInput): Promise<LeadListItem> {
	const raw = await apiFetch<unknown>('/api/leads', {
		method: 'POST',
		body: input,
	});
	const parsed = leadListItemSchema.safeParse(raw);
	if (!parsed.success) {
		throw new Error('Resposta da API em formato inesperado ao criar lead.');
	}
	return parsed.data;
}

async function updateLead(
	leadId: string,
	input: UpdateLeadInput,
): Promise<LeadListItem> {
	const raw = await apiFetch<unknown>(`/api/leads/${leadId}`, {
		method: 'PATCH',
		body: input,
	});
	const parsed = leadListItemSchema.safeParse(raw);
	if (!parsed.success) {
		throw new Error('Resposta da API em formato inesperado ao atualizar lead.');
	}
	return parsed.data;
}

async function reassignLead(
	leadId: string,
	input: ReassignLeadInput,
): Promise<LeadListItem> {
	const raw = await apiFetch<unknown>(`/api/leads/${leadId}/reassign`, {
		method: 'PATCH',
		body: input,
	});
	const parsed = leadListItemSchema.safeParse(raw);
	if (!parsed.success) {
		throw new Error(
			'Resposta da API em formato inesperado ao reatribuir lead.',
		);
	}
	return parsed.data;
}

async function convertLead(leadId: string): Promise<LeadListItem> {
	const raw = await apiFetch<unknown>(`/api/leads/${leadId}/convert`, {
		method: 'PATCH',
	});
	const parsed = leadListItemSchema.safeParse(raw);
	if (!parsed.success) {
		throw new Error('Resposta da API em formato inesperado ao converter lead.');
	}
	return parsed.data;
}

async function deleteLead(leadId: string): Promise<void> {
	await apiFetch(`/api/leads/${leadId}`, {
		method: 'DELETE',
	});
}

type CreateCustomerBody = {
	name: string;
	email?: string | null;
	phone?: string | null;
	cpf?: string | null;
};

type UpdateCustomerBody = {
	name?: string;
	email?: string | null;
	phone?: string | null;
	cpf?: string | null;
};

type CreateStoreBody = {
	name: string;
};

type UpdateStoreBody = {
	name?: string;
};

async function listLeadCustomers(
	signal?: AbortSignal,
): Promise<LeadCustomer[]> {
	const raw = await apiFetch<unknown>('/api/customers', {
		signal,
	});
	return parseLeadCustomersResponse(raw);
}

async function createCustomer(body: CreateCustomerBody): Promise<LeadCustomer> {
	const raw = await apiFetch<unknown>('/api/customers', {
		method: 'POST',
		body,
	});
	return parseLeadCustomerResponse(raw);
}

async function updateCustomer(
	customerId: string,
	body: UpdateCustomerBody,
): Promise<LeadCustomer> {
	const raw = await apiFetch<unknown>(`/api/customers/${customerId}`, {
		method: 'PATCH',
		body,
	});
	return parseLeadCustomerResponse(raw);
}

async function deleteCustomer(customerId: string): Promise<void> {
	await apiFetch(`/api/customers/${customerId}`, {
		method: 'DELETE',
	});
}

async function listLeadStores(signal?: AbortSignal): Promise<LeadStore[]> {
	const raw = await apiFetch<unknown>('/api/leads/catalog/stores', {
		signal,
	});
	return parseLeadStoresResponse(raw);
}

async function createStore(body: CreateStoreBody): Promise<LeadStore> {
	const raw = await apiFetch<unknown>('/api/stores', {
		method: 'POST',
		body,
	});
	return parseLeadStoreResponse(raw);
}

async function updateStore(
	storeId: string,
	body: UpdateStoreBody,
): Promise<LeadStore> {
	const raw = await apiFetch<unknown>(`/api/stores/${storeId}`, {
		method: 'PATCH',
		body,
	});
	return parseLeadStoreResponse(raw);
}

async function deleteStore(storeId: string): Promise<void> {
	await apiFetch(`/api/stores/${storeId}`, {
		method: 'DELETE',
	});
}

async function listLeadOwners(
	signal?: AbortSignal,
): Promise<LeadOwnerRecord[]> {
	const raw = await apiFetch<unknown>('/api/leads/catalog/owners', {
		signal,
	});
	return parseLeadOwnersResponse(raw);
}

export {
	convertLead,
	createCustomer,
	createLead,
	createStore,
	deleteCustomer,
	deleteLead,
	deleteStore,
	fetchLeadsAll,
	fetchLeadsByOwner,
	fetchLeadsByTeam,
	fetchLeadsManager,
	listLeadCustomers,
	listLeadOwners,
	listLeadStores,
	reassignLead,
	updateCustomer,
	updateLead,
	updateStore,
};
export type {
	CreateCustomerBody,
	CreateStoreBody,
	UpdateCustomerBody,
	UpdateStoreBody,
};
