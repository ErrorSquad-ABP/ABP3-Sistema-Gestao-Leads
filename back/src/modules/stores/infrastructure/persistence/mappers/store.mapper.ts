import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../../shared/domain/value-objects/name.value-object.js';
import { Store } from '../../../domain/entities/store.entity.js';
import type { StoreRecord } from '../records/store.record.js';

class StoreMapper {
	static toDomain(record: StoreRecord): Store {
		return new Store(Uuid.parse(record.id), Name.create(record.name));
	}

	static toRecord(store: Store): StoreRecord {
		return {
			id: store.id.value,
			name: store.name.value,
		};
	}
}

export { StoreMapper };
