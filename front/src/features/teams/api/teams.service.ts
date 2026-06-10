import { apiFetch } from '@/lib/http/api-client';

import {
	parseLeadTeamResponse,
	parseLeadTeamsResponse,
} from '@/features/leads/schemas/lead-support.schema';
import type {
	TeamMemberCandidate,
	TeamMutationInput,
	TeamRecord,
	TeamUpdateInput,
} from '@/features/teams/model/teams.model';

async function listTeams(signal?: AbortSignal): Promise<TeamRecord[]> {
	const raw = await apiFetch<unknown>('/api/teams', { signal });
	return parseLeadTeamsResponse(raw);
}

function parseTeamMemberCandidates(data: unknown): TeamMemberCandidate[] {
	if (!Array.isArray(data)) {
		throw new Error('Resposta de candidatos de equipe em formato inesperado.');
	}
	return data.map((item) => {
		if (
			typeof item !== 'object' ||
			item === null ||
			typeof (item as { id?: unknown }).id !== 'string' ||
			typeof (item as { name?: unknown }).name !== 'string' ||
			typeof (item as { email?: unknown }).email !== 'string'
		) {
			throw new Error(
				'Resposta de candidato de equipe em formato inesperado.',
			);
		}
		return {
			id: (item as { id: string }).id,
			name: (item as { name: string }).name,
			email: (item as { email: string }).email,
		};
	});
}

async function listTeamMemberCandidates(
	storeId?: string,
	signal?: AbortSignal,
): Promise<TeamMemberCandidate[]> {
	const params = new URLSearchParams();
	if (storeId) {
		params.set('storeId', storeId);
	}
	const suffix = params.toString() ? `?${params.toString()}` : '';
	const raw = await apiFetch<unknown>(`/api/teams/member-candidates${suffix}`, {
		signal,
	});
	return parseTeamMemberCandidates(raw);
}

async function createTeam(input: TeamMutationInput): Promise<TeamRecord> {
	const raw = await apiFetch<unknown>('/api/teams', {
		method: 'POST',
		body: {
			name: input.name,
			storeId: input.storeId,
			managerId: input.managerId ?? null,
			initialMemberUserIds: input.initialMemberUserIds ?? [],
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

async function addTeamMember(
	teamId: string,
	userId: string,
): Promise<TeamRecord> {
	const raw = await apiFetch<unknown>(`/api/teams/${teamId}/members`, {
		method: 'POST',
		body: { userId },
	});
	return parseLeadTeamResponse(raw);
}

async function removeTeamMember(
	teamId: string,
	userId: string,
): Promise<TeamRecord> {
	const raw = await apiFetch<unknown>(
		`/api/teams/${teamId}/members/${userId}`,
		{
			method: 'DELETE',
		},
	);
	return parseLeadTeamResponse(raw);
}

export {
	addTeamMember,
	assignTeamManager,
	createTeam,
	deleteTeam,
	listTeamMemberCandidates,
	listTeams,
	removeTeamMember,
	updateTeam,
};
