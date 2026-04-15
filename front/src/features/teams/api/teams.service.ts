import { apiFetch } from '@/lib/http/api-client';

import {
	parseLeadTeamResponse,
	parseLeadTeamsResponse,
} from '@/features/leads/schemas/lead-support.schema';
import type {
	TeamMutationInput,
	TeamRecord,
	TeamUpdateInput,
} from '@/features/teams/types/teams.types';

async function listTeams(signal?: AbortSignal): Promise<TeamRecord[]> {
	const raw = await apiFetch<unknown>('/api/teams', { signal });
	return parseLeadTeamsResponse(raw);
}

async function createTeam(input: TeamMutationInput): Promise<TeamRecord> {
	const raw = await apiFetch<unknown>('/api/teams', {
		method: 'POST',
		body: {
			name: input.name,
			storeId: input.storeId,
			managerId: input.managerId ?? null,
		},
	});
	return parseLeadTeamResponse(raw);
}

async function updateTeam(
	teamId: string,
	input: TeamUpdateInput,
): Promise<TeamRecord> {
	const raw = await apiFetch<unknown>(`/api/teams/${teamId}`, {
		method: 'PATCH',
		body: input,
	});
	return parseLeadTeamResponse(raw);
}

async function assignTeamManager(
	teamId: string,
	managerId: string | null,
): Promise<TeamRecord> {
	const raw = await apiFetch<unknown>(`/api/teams/${teamId}/manager`, {
		method: 'PATCH',
		body: {
			managerId,
		},
	});
	return parseLeadTeamResponse(raw);
}

async function deleteTeam(teamId: string): Promise<void> {
	await apiFetch(`/api/teams/${teamId}`, {
		method: 'DELETE',
	});
}

export { assignTeamManager, createTeam, deleteTeam, listTeams, updateTeam };
