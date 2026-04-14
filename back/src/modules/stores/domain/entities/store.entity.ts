import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type { StoreId } from '../../../../shared/domain/types/identifiers.js';
import type { Name } from '../../../../shared/domain/value-objects/name.value-object.js';

/**
 * Store aggregate root (operational context: stores).
 */
class Store extends AggregateRoot {
	private _id: StoreId;
	private _name: Name;

	constructor(id: StoreId, name: Name) {
		super();
		this._id = id;
		this._name = name;
	}

	get id(): StoreId {
		return this._id;
	}

	get name(): Name {
		return this._name;
	}

	/** Renomeia a loja; ignora quando o nome é equivalente. */
	rename(name: Name): void {
		if (this._name.equals(name)) {
			return;
		}
		this._name = name;
	}
}

export { Store };
