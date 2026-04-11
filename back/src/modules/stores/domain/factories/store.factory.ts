import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { Store } from '../entities/store.entity.js';

type CreateStoreParams = {
	readonly name: string;
};

type UpdateStoreParams = {
	readonly name?: string;
};

class StoreFactory {
	create(params: CreateStoreParams): Store {
		return new Store(Uuid.generate(), Name.create(params.name));
	}

	update(store: Store, params: UpdateStoreParams): Store {
		const updatedStore = new Store(store.id, store.name);
		if (params.name !== undefined) {
			updatedStore.changeName(Name.create(params.name));
		}
		return updatedStore;
	}
}

export { StoreFactory };
export type { CreateStoreParams, UpdateStoreParams };
