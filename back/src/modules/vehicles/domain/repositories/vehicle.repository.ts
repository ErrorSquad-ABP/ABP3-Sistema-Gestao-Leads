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

interface IVehicleRepository {
	create(vehicle: Vehicle): Promise<Vehicle>;
	update(vehicle: Vehicle): Promise<Vehicle>;
	findById(id: Uuid): Promise<Vehicle | null>;
	list(filters?: VehicleListFilters): Promise<readonly Vehicle[]>;
}

export type { IVehicleRepository, VehicleListFilters };
