import type {
	TeamId,
	UUID,
} from '../../../../shared/domain/types/identifiers.js';

import type { Lead } from '../entities/lead.entity.js';

/**
 * Persistence port for {@link Lead} (diagram: ILeadRepository).
 */
interface ILeadRepository {
	create(lead: Lead): Promise<Lead>;
	update(lead: Lead): Promise<Lead>;
	delete(id: UUID): Promise<void>;
	findById(id: UUID): Promise<Lead | null>;
	listByOwner(userId: UUID): Promise<Lead[]>;
	listByTeam(teamId: TeamId): Promise<Lead[]>;
}

export type { ILeadRepository };
