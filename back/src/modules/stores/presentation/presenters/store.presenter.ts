import type { StoreResponseDto } from '../../application/dto/store-response.dto.js';
import type { Store } from '../../domain/entities/store.entity.js';

class StorePresenter {
	static toResponse(store: Store): StoreResponseDto {
		return {
			id: store.id.value,
			name: store.name.value,
		} satisfies StoreResponseDto;
	}

	static toResponseList(stores: readonly Store[]): StoreResponseDto[] {
		return stores.map((store) => StorePresenter.toResponse(store));
	}
}

export { StorePresenter };
