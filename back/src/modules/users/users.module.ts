import { Module } from '@nestjs/common';
import { Argon2PasswordHasherService } from '../../shared/infrastructure/security/argon2-password-hasher.service.js';
import { TeamRepositoryFactory } from '../teams/infrastructure/persistence/factories/team-repository.factory.js';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case.js';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case.js';
import { FindUserUseCase } from './application/use-cases/find-user.use-case.js';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case.js';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case.js';
import { UserFactory } from './domain/factories/user.factory.js';
import { UserRepositoryFactory } from './infrastructure/persistence/factories/user-repository.factory.js';
import { UserController } from './presentation/controllers/user.controller.js';

@Module({
	controllers: [UserController],
	providers: [
		UserFactory,
		UserRepositoryFactory,
		TeamRepositoryFactory,
		Argon2PasswordHasherService,
		CreateUserUseCase,
		ListUsersUseCase,
		FindUserUseCase,
		UpdateUserUseCase,
		DeleteUserUseCase,
	],
	exports: [
		UserRepositoryFactory,
		Argon2PasswordHasherService,
		FindUserUseCase,
	],
})
class UsersModule {}

export { UsersModule };
