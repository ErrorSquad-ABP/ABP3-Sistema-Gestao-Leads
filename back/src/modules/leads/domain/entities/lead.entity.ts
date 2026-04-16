import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type { LeadStatus } from '../../../../shared/domain/enums/lead-status.enum.js';
import type { DomainEvent } from '../../../../shared/domain/events/domain-event.js';
import type {
	StoreId,
	Uuid,
} from '../../../../shared/domain/types/identifiers.js';
import type { LeadSource } from '../../../../shared/domain/value-objects/lead-source.value-object.js';
import { LeadAlreadyConvertedError } from '../errors/lead-already-converted.error.js';
import { LeadConvertedEvent } from '../events/lead-converted.event.js';
import { LeadReassignedEvent } from '../events/lead-reassigned.event.js';

/**
 * Lead aggregate root (operational context: leads).
 */
class Lead extends AggregateRoot {
	private _id: Uuid;
	private _customerId: Uuid;
	private _storeId: StoreId;
	private _ownerUserId: Uuid | null;
	private _source: LeadSource;
	private _status: LeadStatus;
	private _vehicleInterestText: string | null;

	constructor(
		id: Uuid,
		customerId: Uuid,
		storeId: StoreId,
		ownerUserId: Uuid | null,
		source: LeadSource,
		status: LeadStatus,
		vehicleInterestText: string | null = null,
	) {
		super();
		this._id = id;
		this._customerId = customerId;
		this._storeId = storeId;
		this._ownerUserId = ownerUserId;
		this._source = source;
		this._status = status;
		this._vehicleInterestText = vehicleInterestText;
	}

	get id(): Uuid {
		return this._id;
	}

	get customerId(): Uuid {
		return this._customerId;
	}

	get storeId(): StoreId {
		return this._storeId;
	}

	get ownerUserId(): Uuid | null {
		return this._ownerUserId;
	}

	get source(): LeadSource {
		return this._source;
	}

	get status(): LeadStatus {
		return this._status;
	}

	get vehicleInterestText(): string | null {
		return this._vehicleInterestText;
	}

	/**
	 * Exposto para {@link LeadFactory} registrar apenas o evento de criação.
	 */
	recordDomainEvent(event: DomainEvent): void {
		this.addDomainEvent(event);
	}

	isConverted(): boolean {
		return this._status === 'CONVERTED';
	}

	changeCustomer(customerId: Uuid): void {
		if (this._customerId.equals(customerId)) {
			return;
		}
		this._customerId = customerId;
	}

	changeStore(storeId: StoreId): void {
		if (this._storeId.equals(storeId)) {
			return;
		}
		this._storeId = storeId;
	}

	changeSource(source: LeadSource): void {
		if (this._source.equals(source)) {
			return;
		}
		this._source = source;
	}

	changeStatus(status: LeadStatus): void {
		if (this._status === status) {
			return;
		}
		this._status = status;
	}

	changeVehicleInterestText(text: string | null): void {
		const normalized = text === null ? null : text.trim();
		const unchanged =
			(this._vehicleInterestText === null && normalized === null) ||
			this._vehicleInterestText === normalized;
		if (unchanged) {
			return;
		}
		this._vehicleInterestText = normalized;
	}

	reassign(ownerUserId: Uuid | null): void {
		const prev = this._ownerUserId;
		const unchanged =
			(prev === null && ownerUserId === null) ||
			(prev !== null && ownerUserId !== null && prev.equals(ownerUserId));

		if (unchanged) {
			return;
		}

		this._ownerUserId = ownerUserId;
		this.addDomainEvent(
			new LeadReassignedEvent(
				this._id.toString(),
				prev?.toString() ?? null,
				ownerUserId?.toString() ?? null,
			),
		);
	}

	convert(): void {
		if (this._status === 'CONVERTED') {
			throw new LeadAlreadyConvertedError(this._id.toString());
		}
		this._status = 'CONVERTED';
		this.addDomainEvent(new LeadConvertedEvent(this._id.toString()));
	}
}

export { Lead };
