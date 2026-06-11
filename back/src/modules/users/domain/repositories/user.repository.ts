import type { UUID } from '../../../../shared/domain/types/identifiers.js';

import type { User } from '../entities/user.entity.js';

type ListUsersPagedQuery = {
	readonly page: number;
	readonly limit: number;
	readonly search?: string;
	readonly role?: string;
	readonly accessGroupId?: string;
};

type UsersAggregateSummary = {
	readonly total: number;
	readonly administrators: number;
	readonly withoutGroup: number;
	readonly withMultipleGroups: number;
};

/**
 * Persistence port for {@link User} (diagram: IUserRepository).
 */
interface IUserRepository {
	create(user: User): Promise<User>;
	update(user: User): Promise<User>;
	delete(id: UUID): Promise<void>;
	findById(id: UUID): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	listByIds(ids: readonly UUID[]): Promise<readonly User[]>;
	listPaged(query: ListUsersPagedQuery): Promise<{
		readonly users: readonly User[];
		readonly total: number;
	}>;
	aggregateSummary(): Promise<UsersAggregateSummary>;
}

export type { IUserRepository, ListUsersPagedQuery, UsersAggregateSummary };
