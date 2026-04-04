import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type { StoreId } from '../../../../shared/domain/types/identifiers.js';
import type { Name } from '../../../../shared/domain/value-objects/name.value-object.js';

/**
 * Store aggregate root (operational context: stores).
 */
class Store extends AggregateRoot {
	readonly id: StoreId;
	name: Name;

	constructor(id: StoreId, name: Name) {
		super();
		this.id = id;
		this.name = name;
	}

	changeName(name: Name): void {
		this.name = name;
	}
}

export { Store };
