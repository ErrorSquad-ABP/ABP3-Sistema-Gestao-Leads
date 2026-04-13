import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import type {
	StoreId,
	TeamId,
	UUID,
} from '../../../../shared/domain/types/identifiers.js';
import type { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { assertTeamManagerAssignment } from '../policies/team-manager.policy.js';

type TeamConstructionSource = 'new' | 'persistence';

/**
 * Team aggregate root: controla membros e gerente conforme o schema Prisma.
 * Gerente exige papel compatível (MANAGER / GENERAL_MANAGER / ADMINISTRATOR).
 */
class Team extends AggregateRoot {
	private _id: TeamId;
	private _name: Name;
	private _storeId: StoreId;
	private _managerId: UUID | null;
	private _memberUserIds: UUID[];

	constructor(
		id: TeamId,
		name: Name,
		storeId: StoreId,
		managerId: UUID | null,
		memberUserIds: readonly UUID[],
		managerRoleWhenPresent: UserRole | null,
		source: TeamConstructionSource,
	) {
		super();
		this._id = id;
		this._name = name;
		this._storeId = storeId;
		this._memberUserIds = [...memberUserIds];
		if (source === 'new') {
			assertTeamManagerAssignment(managerId, managerRoleWhenPresent);
		}
		this._managerId = managerId;
	}

	get id(): TeamId {
		return this._id;
	}

	get name(): Name {
		return this._name;
	}

	get storeId(): StoreId {
		return this._storeId;
	}

	get managerId(): UUID | null {
		return this._managerId;
	}

	/** Membros da equipe (relação TeamMembers); não confundir com o gerente. */
	get memberUserIds(): readonly UUID[] {
		return this._memberUserIds;
	}

	rename(name: Name): void {
		if (this._name.equals(name)) {
			return;
		}
		this._name = name;
	}

	changeStore(storeId: StoreId): void {
		if (this._storeId.equals(storeId)) {
			return;
		}
		this._storeId = storeId;
	}

	/**
	 * Define ou remove o gerente. Com `managerId` não nulo, `managerRole` deve ser o papel atual do utilizador.
	 */
	assignManager(managerId: UUID | null, managerRole: UserRole | null): void {
		assertTeamManagerAssignment(managerId, managerRole);
		const prev = this._managerId;
		const unchanged =
			(prev === null && managerId === null) ||
			(prev !== null && managerId !== null && prev.equals(managerId));
		if (unchanged) {
			return;
		}
		this._managerId = managerId;
	}

	removeManager(): void {
		this.assignManager(null, null);
	}

	hasMember(userId: UUID): boolean {
		return this._memberUserIds.some((id) => id.equals(userId));
	}

	isManagedBy(userId: UUID): boolean {
		return this._managerId?.equals(userId) ?? false;
	}

	addMember(userId: UUID): void {
		if (this.hasMember(userId)) {
			return;
		}
		this._memberUserIds.push(userId);
	}

	removeMember(userId: UUID): void {
		const next = this._memberUserIds.filter((id) => !id.equals(userId));
		if (next.length === this._memberUserIds.length) {
			return;
		}
		this._memberUserIds = next;
	}
}

export { Team };
export type { TeamConstructionSource };
