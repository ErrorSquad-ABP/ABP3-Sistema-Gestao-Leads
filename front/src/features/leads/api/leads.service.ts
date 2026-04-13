import { apiFetch } from '@/lib/http/api-client';

import { parseLeadListResponse } from '../schemas/lead-list.schema';

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
 * Regra de UI: `MANAGER` / `ADMINISTRATOR` com `user.teamId` definido.
 * O servidor exige papel adequado e `teamId` igual ao da conta (`403` caso contrário).
 */
async function fetchLeadsByTeam(teamId: string, signal?: AbortSignal) {
	const raw = await apiFetch<unknown>(`/api/leads/team/${teamId}`, {
		signal,
	});
	return parseLeadListResponse(raw);
}

export { fetchLeadsByOwner, fetchLeadsByTeam };
