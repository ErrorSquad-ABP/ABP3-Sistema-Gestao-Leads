import type { StoreId } from '../../../../shared/domain/types/identifiers.js';

import type { Store } from '../entities/store.entity.js';

type StoreMetrics = {
	readonly storeId: string;
	readonly total: number;
	readonly converted: number;
	readonly openDeals: number;
	readonly conversionRate: number;
	readonly wonValue: number;
};

/**
 * Persistence port for {@link Store} (diagram: IStoreRepository).
 */
interface IStoreRepository {
	create(store: Store): Promise<Store>;
	update(store: Store): Promise<Store>;
	delete(id: StoreId): Promise<void>;
	findById(id: StoreId): Promise<Store | null>;
	list(): Promise<Store[]>;
	listMetrics(): Promise<StoreMetrics[]>;
	/** Contagens usadas para impedir delete com `onDelete: Restrict` (leads / teams). */
	countBlockingReferences(id: StoreId): Promise<{
		readonly leads: number;
		readonly teams: number;
	}>;
}

export type { IStoreRepository, StoreMetrics };
