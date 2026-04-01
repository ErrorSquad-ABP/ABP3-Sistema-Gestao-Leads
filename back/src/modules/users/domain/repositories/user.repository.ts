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
	list(): Promise<User[]>;
}

export type { IUserRepository };
