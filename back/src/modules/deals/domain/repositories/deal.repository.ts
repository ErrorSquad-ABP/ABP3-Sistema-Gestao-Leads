import type { Uuid } from '../../../../shared/domain/types/identifiers.js';
import type { Deal } from '../entities/deal.entity.js';
import type {
	DealListPage,
	DealListPagination,
} from '../types/deal-list-page.js';

type DealListScopedFilters = {
	readonly storeIds?: readonly string[];
	readonly ownerUserId?: string;
	readonly status?: 'OPEN' | 'WON' | 'LOST';
};

interface IDealRepository {
	create(deal: Deal): Promise<Deal>;
	update(deal: Deal): Promise<Deal>;
	delete(id: Uuid): Promise<void>;
	findById(id: Uuid): Promise<Deal | null>;
	findOpenByLeadId(leadId: Uuid): Promise<Deal | null>;
	findOpenByVehicleId(vehicleId: Uuid): Promise<Deal | null>;
	listByLeadId(leadId: Uuid): Promise<readonly Deal[]>;
	listScoped(
		filters: DealListScopedFilters,
		pagination: DealListPagination,
	): Promise<DealListPage>;
}

export type { DealListScopedFilters, IDealRepository };
