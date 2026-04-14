import type { StoreId } from '../../../../shared/domain/types/identifiers.js';

import type { Store } from '../entities/store.entity.js';

/**
 * Persistence port for {@link Store} (diagram: IStoreRepository).
 */
interface IStoreRepository {
	create(store: Store): Promise<Store>;
	update(store: Store): Promise<Store>;
	delete(id: StoreId): Promise<void>;
	findById(id: StoreId): Promise<Store | null>;
	list(): Promise<Store[]>;
	/** Contagens usadas para impedir delete com `onDelete: Restrict` (leads / teams). */
	countBlockingReferences(id: StoreId): Promise<{
		readonly leads: number;
		readonly teams: number;
	}>;
}

export type { IStoreRepository };
