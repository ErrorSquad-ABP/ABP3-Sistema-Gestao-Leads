import type {
	StoreId,
	Uuid,
} from '../../../../shared/domain/types/identifiers.js';
import type { VehicleStatus } from '../../../../shared/domain/enums/vehicle-status.enum.js';
import type { Vehicle } from '../entities/vehicle.entity.js';

type VehicleListFilters = {
	readonly storeId?: StoreId;
	readonly status?: VehicleStatus;
	readonly withoutOpenDeal?: boolean;
};

type VehicleCatalogSort =
	| 'recent'
	| 'price_asc'
	| 'price_desc'
	| 'mileage_asc'
	| 'mileage_desc'
	| 'interest_desc';

type VehicleCatalogFilters = {
	readonly storeId?: StoreId;
	readonly status?: VehicleStatus;
	readonly search?: string;
	readonly sort?: VehicleCatalogSort;
};

type VehiclePriceComparison = 'ABOVE_AVERAGE' | 'BELOW_AVERAGE' | 'AT_AVERAGE';

type VehicleCatalogInterest = {
	readonly leadId: string;
	readonly dealId: string;
	readonly customerName: string;
	readonly dealTitle: string;
	readonly dealStage: string;
	readonly dealStatus: string;
	readonly createdAt: Date;
};

type VehicleCatalogItem = {
	readonly vehicle: Vehicle;
	readonly storeName: string;
	readonly dealCount: number;
	readonly interests: readonly VehicleCatalogInterest[];
	readonly daysInStock: number;
	readonly priceComparison: VehiclePriceComparison | null;
};

type VehicleCatalogSummary = {
	readonly total: number;
	readonly available: number;
	readonly reserved: number;
	readonly sold: number;
	readonly inactive: number;
	readonly highInterest: number;
};

type VehicleCatalogPage = {
	readonly items: readonly VehicleCatalogItem[];
	readonly summary: VehicleCatalogSummary;
	readonly page: number;
	readonly limit: number;
	readonly total: number;
	readonly totalPages: number;
};

interface IVehicleRepository {
	create(vehicle: Vehicle): Promise<Vehicle>;
	update(vehicle: Vehicle): Promise<Vehicle>;
	delete(id: Uuid): Promise<void>;
	findById(id: Uuid): Promise<Vehicle | null>;
	countDealsByVehicleId(id: Uuid): Promise<number>;
	list(filters?: VehicleListFilters): Promise<readonly Vehicle[]>;
	listCatalog(
		filters: VehicleCatalogFilters,
		pagination: { readonly page: number; readonly limit: number },
	): Promise<VehicleCatalogPage>;
}

export type {
	IVehicleRepository,
	VehicleCatalogFilters,
	VehicleCatalogInterest,
	VehicleCatalogItem,
	VehicleCatalogPage,
	VehicleCatalogSort,
	VehicleCatalogSummary,
	VehicleListFilters,
	VehiclePriceComparison,
};
