import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UserRepositoryFactory } from '../../infrastructure/persistence/factories/user-repository.factory.js';

@Injectable()
class FindUserUseCase {
	constructor(private readonly userRepositoryFactory: UserRepositoryFactory) {}

	async execute(userId: string) {
		const users = this.userRepositoryFactory.create();
		const user = await users.findById(Uuid.parse(userId));
		if (!user) {
			throw new UserNotFoundError(userId);
		}
		return user;
	}
}

export { FindUserUseCase };
