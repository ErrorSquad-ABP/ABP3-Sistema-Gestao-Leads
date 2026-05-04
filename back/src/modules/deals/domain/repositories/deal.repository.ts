import type { Uuid } from '../../../../shared/domain/types/identifiers.js';
import type { DealImportance } from '../../../../shared/domain/enums/deal-importance.enum.js';
import type { DealStage } from '../../../../shared/domain/enums/deal-stage.enum.js';
import type { Deal } from '../entities/deal.entity.js';
import type {
	DealListPage,
	DealListPagination,
} from '../types/deal-list-page.js';

type DealListScopedFilters = {
	readonly storeIds?: readonly string[];
	readonly ownerUserId?: string;
	readonly status?: 'OPEN' | 'WON' | 'LOST';
	readonly importance?: DealImportance;
	readonly stage?: DealStage;
	readonly search?: string;
	/** Apenas `listPipelineStageEnriched`: ordena por valor; ausente mantém `createdAt` desc. */
	readonly valueSort?: 'asc' | 'desc';
};

interface IDealRepository {
	create(deal: Deal): Promise<Deal>;
	update(deal: Deal): Promise<Deal>;
	delete(id: Uuid): Promise<void>;
	findById(id: Uuid): Promise<Deal | null>;
	findByIdEnriched(id: Uuid): Promise<DealEnrichedRow | null>;
	findOpenByLeadId(leadId: Uuid): Promise<Deal | null>;
	findOpenByVehicleId(vehicleId: Uuid): Promise<Deal | null>;
	listByLeadId(leadId: Uuid): Promise<readonly Deal[]>;
	listByLeadIdEnriched(leadId: Uuid): Promise<readonly DealEnrichedRow[]>;
	listScoped(
		filters: DealListScopedFilters,
		pagination: DealListPagination,
	): Promise<DealListPage>;
	listScopedEnriched(
		filters: DealListScopedFilters,
		pagination: DealListPagination,
	): Promise<DealEnrichedListPage>;
	listPipelineStagesEnriched(
		filters: DealListScopedFilters,
		pagination: DealListPagination,
	): Promise<readonly DealPipelineStagePage[]>;
	listPipelineStageEnriched(
		filters: DealListScopedFilters & { readonly stage: DealStage },
		pagination: DealListPagination,
	): Promise<DealPipelineStagePage>;
}

type DealEnrichedRow = {
	readonly id: string;
	readonly leadId: string;
	readonly vehicleId: string;
	readonly title: string;
	readonly value: { toString(): string } | null;
	readonly importance: string;
	readonly stage: string;
	readonly status: string;
	readonly closedAt: Date | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;
	readonly lead: {
		readonly storeId: string;
		readonly ownerUserId: string | null;
		readonly customer: { readonly name: string } | null;
		readonly owner: { readonly name: string } | null;
	} | null;
	readonly vehicle: {
		readonly brand: string;
		readonly model: string;
		readonly modelYear: number;
		readonly plate: string | null;
	} | null;
};

type DealEnrichedListPage = {
	readonly items: readonly DealEnrichedRow[];
	readonly page: number;
	readonly limit: number;
	readonly total: number;
	readonly totalPages: number;
};

type DealPipelineStagePage = {
	readonly stage: DealStage;
	readonly items: readonly DealEnrichedRow[];
	readonly page: number;
	readonly limit: number;
	readonly total: number;
	readonly totalPages: number;
	readonly totalValue: string | null;
};

export type {
	DealEnrichedListPage,
	DealEnrichedRow,
	DealListScopedFilters,
	DealPipelineStagePage,
	IDealRepository,
};
