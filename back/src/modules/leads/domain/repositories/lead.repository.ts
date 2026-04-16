import type {
	TeamId,
	UUID,
} from '../../../../shared/domain/types/identifiers.js';

import type { Lead } from '../entities/lead.entity.js';
import type { LeadListPage } from '../types/lead-list-page.js';
import type { LeadListPagination } from '../types/lead-list-page.js';

/**
 * Persistence port for {@link Lead} (diagram: ILeadRepository).
 */
interface ILeadRepository {
	create(lead: Lead): Promise<Lead>;
	update(lead: Lead): Promise<Lead>;
	delete(id: UUID): Promise<void>;
	findById(id: UUID): Promise<Lead | null>;
	listByOwner(
		userId: UUID,
		pagination: LeadListPagination,
	): Promise<LeadListPage>;
	listByTeam(
		teamId: TeamId,
		pagination: LeadListPagination,
	): Promise<LeadListPage>;
	listAll(pagination: LeadListPagination): Promise<LeadListPage>;
	listByReadableTeams(
		teamIds: readonly string[],
		pagination: LeadListPagination,
	): Promise<LeadListPage>;
}

export type { ILeadRepository };
