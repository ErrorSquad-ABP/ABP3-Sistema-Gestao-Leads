import type { VehicleImageMetadata } from '../../domain/entities/vehicle.entity.js';

type VehicleImageLookupInput = {
	readonly brand: string;
	readonly model: string;
	readonly modelYear: number;
};

interface VehicleImageProvider {
	resolve(input: VehicleImageLookupInput): Promise<VehicleImageMetadata | null>;
}

export type { VehicleImageLookupInput, VehicleImageProvider };
