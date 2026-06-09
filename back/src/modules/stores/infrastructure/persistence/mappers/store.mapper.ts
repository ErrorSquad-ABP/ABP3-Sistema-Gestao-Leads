import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../../shared/domain/value-objects/name.value-object.js';
import { Store } from '../../../domain/entities/store.entity.js';
import type { StoreRecord } from '../records/store.record.js';

class StoreMapper {
	static toDomain(record: StoreRecord): Store {
		return new Store(Uuid.parse(record.id), Name.create(record.name), {
			addressLine: record.addressLine,
			city: record.city,
			coverage: record.coverage,
			distributionRegion: record.distributionRegion,
			region: record.region,
			scope: record.scope,
			state: record.state,
		});
	}

	static toRecord(store: Store): StoreRecord {
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
		};
	}
}

export { StoreMapper };
