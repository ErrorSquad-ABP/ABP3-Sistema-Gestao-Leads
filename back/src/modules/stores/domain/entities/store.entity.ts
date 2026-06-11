import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type { StoreId } from '../../../../shared/domain/types/identifiers.js';
import type { Name } from '../../../../shared/domain/value-objects/name.value-object.js';

type StoreDetails = {
	readonly addressLine: string | null;
	readonly city: string | null;
	readonly coverage: string | null;
	readonly distributionRegion: string | null;
	readonly region: string | null;
	readonly scope: string | null;
	readonly state: string | null;
};

/**
 * Store aggregate root (operational context: stores).
 */
class Store extends AggregateRoot {
	private _id: StoreId;
	private _name: Name;
	private _details: StoreDetails;

	constructor(id: StoreId, name: Name, details: Partial<StoreDetails> = {}) {
		super();
		this._id = id;
		this._name = name;
		this._details = Store.normalizeDetails(details);
	}

	get id(): StoreId {
		return this._id;
	}

	get name(): Name {
		return this._name;
	}

	get addressLine(): string | null {
		return this._details.addressLine;
	}

	get city(): string | null {
		return this._details.city;
	}

	get coverage(): string | null {
		return this._details.coverage;
	}

	get distributionRegion(): string | null {
		return this._details.distributionRegion;
	}

	get region(): string | null {
		return this._details.region;
	}

	get scope(): string | null {
		return this._details.scope;
	}

	get state(): string | null {
		return this._details.state;
	}

	/** Renomeia a loja; ignora quando o nome é equivalente. */
	rename(name: Name): void {
		if (this._name.equals(name)) {
			return;
		}
		this._name = name;
	}

	updateDetails(details: Partial<StoreDetails>): void {
		this._details = Store.normalizeDetails({
			...this._details,
			...details,
		});
	}

	private static normalizeDetails(
		details: Partial<StoreDetails>,
	): StoreDetails {
		return {
			addressLine: details.addressLine ?? null,
			city: details.city ?? null,
			coverage: details.coverage ?? null,
			distributionRegion: details.distributionRegion ?? null,
			region: details.region ?? null,
			scope: details.scope ?? null,
			state: details.state ?? null,
		};
	}
}

export type { StoreDetails };
export { Store };
