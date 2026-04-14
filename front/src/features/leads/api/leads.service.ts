import { apiFetch } from '@/lib/http/api-client';

import { parseLeadListResponse } from '../schemas/lead-list.schema';
import {
	parseLeadCustomersResponse,
	parseLeadOwnersResponse,
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

/**
 * Lista leads cujo `ownerUserId` corresponde ao utilizador indicado.
 * Regra de UI: tipicamente `ATTENDANT` com o próprio `user.id`.
 * O servidor rejeita `ownerUserId` diferente do utilizador autenticado (`403`).
 */
async function fetchLeadsByOwner(ownerUserId: string, signal?: AbortSignal) {
	const raw = await apiFetch<unknown>(`/api/leads/owner/${ownerUserId}`, {
		signal,
	});
	return parseLeadListResponse(raw);
}

/**
 * Lista leads associados à equipa.
 * O servidor aplica `LeadAccessPolicy` (equipas membro/gestor; papéis globais podem ler qualquer `teamId`).
 */
async function fetchLeadsByTeam(teamId: string, signal?: AbortSignal) {
	const raw = await apiFetch<unknown>(`/api/leads/team/${teamId}`, {
		signal,
	});
	return parseLeadListResponse(raw);
}

/**
 * Lista todos os leads (`GET /api/leads/all`). Reservado a `ADMINISTRATOR` e `GENERAL_MANAGER` no servidor.
 */
async function fetchLeadsAll(signal?: AbortSignal) {
	const raw = await apiFetch<unknown>('/api/leads/all', {
		signal,
	});
	return parseLeadListResponse(raw);
}

async function createLead(input: CreateLeadInput): Promise<LeadListItem> {
	const raw = await apiFetch<unknown>('/api/leads', {
		method: 'POST',
		body: input,
	});
	return parseLeadListResponse([raw])[0];
}

async function updateLead(
	leadId: string,
	input: UpdateLeadInput,
): Promise<LeadListItem> {
	const raw = await apiFetch<unknown>(`/api/leads/${leadId}`, {
		method: 'PATCH',
		body: input,
	});
	return parseLeadListResponse([raw])[0];
}

async function reassignLead(
	leadId: string,
	input: ReassignLeadInput,
): Promise<LeadListItem> {
	const raw = await apiFetch<unknown>(`/api/leads/${leadId}/reassign`, {
		method: 'PATCH',
		body: input,
	});
	return parseLeadListResponse([raw])[0];
}

async function convertLead(leadId: string): Promise<LeadListItem> {
	const raw = await apiFetch<unknown>(`/api/leads/${leadId}/convert`, {
		method: 'PATCH',
	});
	return parseLeadListResponse([raw])[0];
}

async function deleteLead(leadId: string): Promise<void> {
	await apiFetch(`/api/leads/${leadId}`, {
		method: 'DELETE',
	});
}

async function listLeadCustomers(
	signal?: AbortSignal,
): Promise<LeadCustomer[]> {
	const raw = await apiFetch<unknown>('/api/customers', {
		signal,
	});
	return parseLeadCustomersResponse(raw);
}

async function listLeadStores(signal?: AbortSignal): Promise<LeadStore[]> {
	const raw = await apiFetch<unknown>('/api/leads/catalog/stores', {
		signal,
	});
	return parseLeadStoresResponse(raw);
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
	createLead,
	deleteLead,
	fetchLeadsAll,
	fetchLeadsByOwner,
	fetchLeadsByTeam,
	listLeadCustomers,
	listLeadOwners,
	listLeadStores,
	reassignLead,
	updateLead,
};
