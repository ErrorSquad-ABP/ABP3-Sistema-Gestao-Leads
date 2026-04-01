import type { TeamId } from '../../../../shared/domain/types/identifiers.js';

import type { Team } from '../entities/team.entity.js';

/**
 * Persistence port for {@link Team} (diagram: ITeamRepository).
 */
interface ITeamRepository {
	create(team: Team): Promise<Team>;
	update(team: Team): Promise<Team>;
	delete(id: TeamId): Promise<void>;
	findById(id: TeamId): Promise<Team | null>;
	list(): Promise<Team[]>;
}

export type { ITeamRepository };
