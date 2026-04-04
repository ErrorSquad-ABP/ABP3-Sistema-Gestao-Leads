import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type {
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

	constructor(id: TeamId, name: Name, managerId: UUID | null) {
		super();
		this.id = id;
		this.name = name;
		this.managerId = managerId;
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
}

export { Team };
