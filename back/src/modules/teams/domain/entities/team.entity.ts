import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type {
	StoreId,
	TeamId,
	UUID,
} from '../../../../shared/domain/types/identifiers.js';
import type { Name } from '../../../../shared/domain/value-objects/name.value-object.js';

/**
 * Team aggregate root (operational context: teams).
 */
class Team extends AggregateRoot {
	readonly id: TeamId;
	name: Name;
	managerId: UUID | null;
	storeId: StoreId | null;

	constructor(
		id: TeamId,
		name: Name,
		managerId: UUID | null,
		storeId: StoreId | null,
	) {
		super();
		this.id = id;
		this.name = name;
		this.managerId = managerId;
		this.storeId = storeId;
	}

	changeName(name: Name): void {
		this.name = name;
	}

	assignManager(userId: UUID): void {
		this.managerId = userId;
	}

	clearManager(): void {
		this.managerId = null;
	}

	assignStore(storeId: StoreId): void {
		this.storeId = storeId;
	}

	clearStore(): void {
		this.storeId = null;
	}
}

export { Team };
