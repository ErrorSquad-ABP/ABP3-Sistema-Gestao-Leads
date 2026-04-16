import { assertCanonicalSupportedFuelType } from '../../../../shared/domain/enums/supported-fuel-type.enum.js';
import { assertCanonicalVehicleStatus } from '../../../../shared/domain/enums/vehicle-status.enum.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Money } from '../../../../shared/domain/value-objects/money.value-object.js';
import { Vehicle } from '../entities/vehicle.entity.js';

type CreateVehicleParams = {
	readonly storeId: string;
	readonly brand: string;
	readonly model: string;
	readonly version?: string | null;
	readonly modelYear: number;
	readonly manufactureYear?: number | null;
	readonly color?: string | null;
	readonly mileage: number;
	readonly supportedFuelType: string;
	readonly price: string;
	readonly status?: string;
	readonly plate?: string | null;
	readonly vin?: string | null;
};

class VehicleFactory {
	create(params: CreateVehicleParams): Vehicle {
		const now = new Date();
		const status = params.status
			? assertCanonicalVehicleStatus(params.status)
			: 'AVAILABLE';

		return new Vehicle(
			Uuid.generate(),
			Uuid.parse(params.storeId),
			params.brand,
			params.model,
			params.version ?? null,
			params.modelYear,
			params.manufactureYear ?? null,
			params.color ?? null,
			params.mileage,
			assertCanonicalSupportedFuelType(params.supportedFuelType),
			Money.fromDecimalString(params.price),
			status,
			params.plate ?? null,
			params.vin ?? null,
			now,
			now,
		);
	}
}

export { VehicleFactory };
export type { CreateVehicleParams };
