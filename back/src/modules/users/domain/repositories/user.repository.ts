import type { UUID } from '../../../../shared/domain/types/identifiers.js';

import type { User } from '../entities/user.entity.js';

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
	listPaged(query: {
		readonly page: number;
		readonly limit: number;
	}): Promise<{ readonly users: readonly User[]; readonly total: number }>;
}

export type { IUserRepository };
