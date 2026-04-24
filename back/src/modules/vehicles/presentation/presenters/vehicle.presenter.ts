import type { Vehicle } from '../../domain/entities/vehicle.entity.js';
import type { VehicleResponseDto } from '../../application/dto/vehicle-response.dto.js';

class VehiclePresenter {
	static toResponse(vehicle: Vehicle): VehicleResponseDto {
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
			createdAt: vehicle.createdAt,
			updatedAt: vehicle.updatedAt,
		} as VehicleResponseDto;
	}

	static toResponseList(vehicles: readonly Vehicle[]): VehicleResponseDto[] {
		return vehicles.map((v) => VehiclePresenter.toResponse(v));
	}
}

export { VehiclePresenter };
