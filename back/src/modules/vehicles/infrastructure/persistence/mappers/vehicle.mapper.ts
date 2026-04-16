import type { Vehicle as PrismaVehicle } from '../../../../../generated/prisma/client.js';
import { assertCanonicalSupportedFuelType } from '../../../../../shared/domain/enums/supported-fuel-type.enum.js';
import { assertCanonicalVehicleStatus } from '../../../../../shared/domain/enums/vehicle-status.enum.js';
import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import { Money } from '../../../../../shared/domain/value-objects/money.value-object.js';
import { Vehicle } from '../../../domain/entities/vehicle.entity.js';

class VehicleMapper {
	static toDomain(record: PrismaVehicle): Vehicle {
		return new Vehicle(
			Uuid.parse(record.id),
			Uuid.parse(record.storeId),
			record.brand,
			record.model,
			record.version ?? null,
			record.modelYear,
			record.manufactureYear ?? null,
			record.color ?? null,
			record.mileage,
			assertCanonicalSupportedFuelType(record.supportedFuelType),
			Money.fromDecimalString(record.price.toString()),
			assertCanonicalVehicleStatus(record.status),
			record.plate ?? null,
			record.vin ?? null,
			record.createdAt,
			record.updatedAt,
		);
	}

	static toPersistence(vehicle: Vehicle): {
		readonly id: string;
		readonly storeId: string;
		readonly brand: string;
		readonly model: string;
		readonly version: string | null;
		readonly modelYear: number;
		readonly manufactureYear: number | null;
		readonly color: string | null;
		readonly mileage: number;
		readonly supportedFuelType: PrismaVehicle['supportedFuelType'];
		readonly price: string;
		readonly status: PrismaVehicle['status'];
		readonly plate: string | null;
		readonly vin: string | null;
	} {
		return {
			id: vehicle.id.value,
			storeId: vehicle.storeId.value,
			brand: vehicle.brand,
			model: vehicle.model,
			version: vehicle.version,
			modelYear: vehicle.modelYear,
			manufactureYear: vehicle.manufactureYear,
			color: vehicle.color,
			mileage: vehicle.mileage,
			supportedFuelType: vehicle.supportedFuelType,
			price: vehicle.price.toDecimalString(),
			status: vehicle.status,
			plate: vehicle.plate,
			vin: vehicle.vin,
		};
	}
}

export { VehicleMapper };
