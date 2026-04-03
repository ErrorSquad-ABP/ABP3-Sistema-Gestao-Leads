import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: Nest DI
import { UserRepositoryFactory } from '../../infrastructure/persistence/factories/user-repository.factory.js';

@Injectable()
class ListUsersUseCase {
	constructor(private readonly userRepositoryFactory: UserRepositoryFactory) {}

	async execute() {
		const users = this.userRepositoryFactory.create();
		return users.list();
	}
}

export { ListUsersUseCase };
