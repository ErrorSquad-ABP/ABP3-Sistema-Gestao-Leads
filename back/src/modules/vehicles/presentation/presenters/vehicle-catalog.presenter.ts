import type { VehicleCatalogPage } from '../../domain/repositories/vehicle.repository.js';
import type { VehicleCatalogResponseDto } from '../../application/dto/vehicle-catalog-response.dto.js';
import { VehiclePresenter } from './vehicle.presenter.js';

class VehicleCatalogPresenter {
	static toResponse(page: VehicleCatalogPage): VehicleCatalogResponseDto {
		return {
			items: page.items.map((item) => ({
				vehicle: VehiclePresenter.toResponse(item.vehicle),
				storeName: item.storeName,
				dealCount: item.dealCount,
				interests: [...item.interests],
				daysInStock: item.daysInStock,
				priceComparison: item.priceComparison,
			})),
			summary: page.summary,
			page: page.page,
			limit: page.limit,
			total: page.total,
			totalPages: page.totalPages,
		};
	}
}

export { VehicleCatalogPresenter };
