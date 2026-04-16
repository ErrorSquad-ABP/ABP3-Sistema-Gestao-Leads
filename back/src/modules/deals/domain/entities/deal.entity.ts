import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type { DealImportance } from '../../../../shared/domain/enums/deal-importance.enum.js';
import type { DealStage } from '../../../../shared/domain/enums/deal-stage.enum.js';
import type { DealStatus } from '../../../../shared/domain/enums/deal-status.enum.js';
import type { Money } from '../../../../shared/domain/value-objects/money.value-object.js';
// biome-ignore lint/style/useImportType: Uuid é classe em runtime (parse/generate)
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { DealAlreadyClosedError } from '../errors/deal-already-closed.error.js';
import { assertAdjacentDealStageTransition } from '../policies/deal-stage-transition.policy.js';

/**
 * Negociação vinculada a um lead (RF03).
 */
class Deal extends AggregateRoot {
	private _id: Uuid;
	private _leadId: Uuid;
	private _vehicleId: Uuid;
	private _title: string;
	private _value: Money | null;
	private _importance: DealImportance;
	private _stage: DealStage;
	private _status: DealStatus;
	private _closedAt: Date | null;
	private _createdAt: Date;
	private _updatedAt: Date;

	constructor(
		id: Uuid,
		leadId: Uuid,
		vehicleId: Uuid,
		title: string,
		value: Money | null,
		importance: DealImportance,
		stage: DealStage,
		status: DealStatus,
		closedAt: Date | null,
		createdAt: Date,
		updatedAt: Date,
	) {
		super();
		this._id = id;
		this._leadId = leadId;
		this._vehicleId = vehicleId;
		this._title = title;
		this._value = value;
		this._importance = importance;
		this._stage = stage;
		this._status = status;
		this._closedAt = closedAt;
		this._createdAt = createdAt;
		this._updatedAt = updatedAt;
	}

	get id(): Uuid {
		return this._id;
	}

	get leadId(): Uuid {
		return this._leadId;
	}

	get vehicleId(): Uuid {
		return this._vehicleId;
	}

	get title(): string {
		return this._title;
	}

	get value(): Money | null {
		return this._value;
	}

	get importance(): DealImportance {
		return this._importance;
	}

	get stage(): DealStage {
		return this._stage;
	}

	get status(): DealStatus {
		return this._status;
	}

	get closedAt(): Date | null {
		return this._closedAt;
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}

	isOpen(): boolean {
		return this._status === 'OPEN';
	}

	private assertOpenForFieldChanges(): void {
		if (!this.isOpen()) {
			throw new DealAlreadyClosedError(this._id.value);
		}
	}

	changeTitle(title: string): void {
		this.assertOpenForFieldChanges();
		if (this._title === title) {
			return;
		}
		this._title = title;
	}

	changeValue(value: Money | null): void {
		this.assertOpenForFieldChanges();
		const unchanged =
			(this._value === null && value === null) ||
			(this._value !== null && value !== null && this._value.equals(value));
		if (unchanged) {
			return;
		}
		this._value = value;
	}

	changeVehicle(vehicleId: Uuid): void {
		this.assertOpenForFieldChanges();
		if (this._vehicleId.equals(vehicleId)) {
			return;
		}
		this._vehicleId = vehicleId;
	}

	changeImportance(importance: DealImportance): void {
		this.assertOpenForFieldChanges();
		if (this._importance === importance) {
			return;
		}
		this._importance = importance;
	}

	changeStage(stage: DealStage): void {
		this.assertOpenForFieldChanges();
		if (this._stage === stage) {
			return;
		}
		assertAdjacentDealStageTransition(this._stage, stage);
		this._stage = stage;
	}

	/**
	 * Transição de OPEN para WON ou LOST. Não reabre negociação encerrada.
	 */
	changeStatus(next: DealStatus): void {
		if (this._status === next) {
			return;
		}
		if (this._status !== 'OPEN') {
			throw new DealAlreadyClosedError(this._id.value);
		}
		if (next === 'OPEN') {
			return;
		}
		this._status = next;
		this._closedAt = new Date();
	}
}

export { Deal };
