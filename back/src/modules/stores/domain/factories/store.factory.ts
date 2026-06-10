import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { Store, type StoreDetails } from '../entities/store.entity.js';

type CreateStoreParams = {
	readonly name: string;
} & Partial<StoreDetails>;

class StoreFactory {
	create(params: CreateStoreParams): Store {
		return new Store(Uuid.generate(), Name.create(params.name), params);
	}
}

export type { CreateStoreParams };
export { StoreFactory };
