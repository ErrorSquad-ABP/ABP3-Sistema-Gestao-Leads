import type { TeamSummary } from '../types/teams.types';

function createTeamLabel(team: TeamSummary | null | undefined) {
	return team?.name ?? 'Sem equipe';
}

export { createTeamLabel };
