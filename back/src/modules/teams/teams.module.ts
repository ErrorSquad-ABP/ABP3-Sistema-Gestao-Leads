import { Module } from '@nestjs/common';

import { UserRepositoryFactory } from '../users/infrastructure/persistence/factories/user-repository.factory.js';
import { CreateTeamUseCase } from './application/use-cases/create-team.use-case.js';
import { DeleteTeamUseCase } from './application/use-cases/delete-team.use-case.js';
import { FindTeamUseCase } from './application/use-cases/find-team.use-case.js';
import { ListTeamsUseCase } from './application/use-cases/list-teams.use-case.js';
import { UpdateTeamUseCase } from './application/use-cases/update-team.use-case.js';
import { TeamFactory } from './domain/factories/team.factory.js';
import { TeamRepositoryFactory } from './infrastructure/persistence/factories/team-repository.factory.js';
import { TeamController } from './presentation/controllers/team.controller.js';

@Module({
	controllers: [TeamController],
	providers: [
		TeamFactory,
		TeamRepositoryFactory,
		UserRepositoryFactory,
		CreateTeamUseCase,
		UpdateTeamUseCase,
		FindTeamUseCase,
		ListTeamsUseCase,
		DeleteTeamUseCase,
	],
})
class TeamsModule {}

export { TeamsModule };
