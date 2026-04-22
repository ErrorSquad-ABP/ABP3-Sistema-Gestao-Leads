import type { z } from 'zod';

import type { vehicleFormSchema } from '../schemas/vehicle-management.schema';
import type {
	supportedFuelTypes,
	vehicleSchema,
	vehicleStatuses,
} from '../schemas/vehicle.schema';

type Vehicle = z.infer<typeof vehicleSchema>;
type VehicleFormInput = z.input<typeof vehicleFormSchema>;
type VehicleFormOutput = z.output<typeof vehicleFormSchema>;
type VehicleStatus = (typeof vehicleStatuses)[number];
type SupportedFuelType = (typeof supportedFuelTypes)[number];

type CreateVehicleInput = {
	storeId: string;
	brand: string;
	model: string;
	version?: string | null;
	modelYear: number;
	manufactureYear?: number | null;
	color?: string | null;
	mileage: number;
	supportedFuelType: SupportedFuelType;
	price: string;
	status?: VehicleStatus;
	plate?: string | null;
	vin?: string | null;
};

type UpdateVehicleInput = Partial<CreateVehicleInput>;

export type {
	CreateVehicleInput,
	SupportedFuelType,
	UpdateVehicleInput,
	Vehicle,
	VehicleFormInput,
	VehicleFormOutput,
	VehicleStatus,
};
