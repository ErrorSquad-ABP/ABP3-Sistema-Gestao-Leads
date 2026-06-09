import type { StoreResponseDto } from '../../application/dto/store-response.dto.js';
import type { Store } from '../../domain/entities/store.entity.js';

class StorePresenter {
	static toResponse(store: Store): StoreResponseDto {
		return {
			addressLine: store.addressLine,
			city: store.city,
			coverage: store.coverage,
			distributionRegion: store.distributionRegion,
			id: store.id.value,
			name: store.name.value,
			region: store.region,
			scope: store.scope,
			state: store.state,
		} as StoreResponseDto;
	}

	static toResponseList(stores: Store[]): StoreResponseDto[] {
		return stores.map((store) => StorePresenter.toResponse(store));
	}
}

export { StorePresenter };
