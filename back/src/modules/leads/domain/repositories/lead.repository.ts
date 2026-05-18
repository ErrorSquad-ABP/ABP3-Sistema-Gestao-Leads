import type {
	TeamId,
	UUID,
} from '../../../../shared/domain/types/identifiers.js';

import type { Lead } from '../entities/lead.entity.js';
import type { LeadListPage } from '../types/lead-list-page.js';
import type { LeadListPagination } from '../types/lead-list-page.js';

type LeadListFilters = {
	readonly withoutOpenDeal?: boolean;
};

type LeadCatalogStatus =
	| 'NEW'
	| 'CONTACTED'
	| 'QUALIFIED'
	| 'NEGOTIATING'
	| 'CONVERTED'
	| 'LOST';

type LeadCatalogSource =
	| 'WEBSITE'
	| 'WHATSAPP'
	| 'PHONE'
	| 'WALK_IN'
	| 'INDICATION'
	| 'OTHER'
	| 'INSTAGRAM'
	| 'FACEBOOK'
	| 'MERCADO_LIVRE';

type LeadCatalogSort = 'recent' | 'last_activity' | 'status' | 'source';

type LeadCatalogScope =
	| { readonly kind: 'all' }
	| { readonly kind: 'owner'; readonly ownerUserId: UUID }
	| { readonly kind: 'readableTeams'; readonly teamIds: readonly string[] };

type LeadCatalogFilters = {
	readonly scope: LeadCatalogScope;
	readonly search?: string;
	readonly status?: LeadCatalogStatus;
	readonly source?: LeadCatalogSource;
	readonly storeId?: UUID;
	readonly ownerUserId?: UUID;
	readonly activityStartDate?: Date;
	readonly activityEndDate?: Date;
	readonly sort?: LeadCatalogSort;
};

type LeadCatalogCustomer = {
	readonly id: string;
	readonly name: string;
	readonly email: string | null;
	readonly phone: string | null;
	readonly cpf: string | null;
};

type LeadCatalogStore = {
	readonly id: string;
	readonly name: string;
};

type LeadCatalogOwner = {
	readonly id: string;
	readonly name: string;
	readonly email: string;
} | null;

type LeadCatalogItem = {
	readonly lead: Lead;
	readonly customer: LeadCatalogCustomer;
	readonly store: LeadCatalogStore;
	readonly owner: LeadCatalogOwner;
	readonly lastActivityAt: Date | null;
	readonly lastActivityLabel: string;
	readonly openDealsCount: number;
	readonly totalDealsCount: number;
	readonly hasInteraction: boolean;
};

type LeadCatalogSummary = {
	readonly total: number;
	readonly withInteraction: number;
	readonly converted: number;
	readonly staleNoContact: number;
	readonly conversionRate: number;
	readonly wonValue: string;
};

type LeadCatalogBreakdownItem = {
	readonly label: string;
	readonly count: number;
};

type LeadCatalogFunnel = {
	readonly totalLeads: number;
	readonly withInteraction: number;
	readonly openDeals: number;
	readonly converted: number;
};

type LeadCatalogPage = {
	readonly items: readonly LeadCatalogItem[];
	readonly summary: LeadCatalogSummary;
	readonly funnel: LeadCatalogFunnel;
	readonly origins: readonly LeadCatalogBreakdownItem[];
	readonly page: number;
	readonly limit: number;
	readonly total: number;
	readonly totalPages: number;
};

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
		filters?: LeadListFilters,
	): Promise<LeadListPage>;
	listByTeam(
		teamId: TeamId,
		pagination: LeadListPagination,
		filters?: LeadListFilters,
	): Promise<LeadListPage>;
	listAll(
		pagination: LeadListPagination,
		filters?: LeadListFilters,
	): Promise<LeadListPage>;
	listByReadableTeams(
		teamIds: readonly string[],
		pagination: LeadListPagination,
		filters?: LeadListFilters,
	): Promise<LeadListPage>;
	listCatalog(
		filters: LeadCatalogFilters,
		pagination: LeadListPagination,
	): Promise<LeadCatalogPage>;
}

export type {
	ILeadRepository,
	LeadCatalogBreakdownItem,
	LeadCatalogFilters,
	LeadCatalogFunnel,
	LeadCatalogItem,
	LeadCatalogPage,
	LeadCatalogScope,
	LeadCatalogSort,
	LeadCatalogSource,
	LeadCatalogStatus,
	LeadCatalogSummary,
	LeadListFilters,
};
