import { Module } from '@nestjs/common';

import { StoreRepositoryFactory } from '../stores/infrastructure/persistence/factories/store-repository.factory.js';
import { UserRepositoryFactory } from '../users/infrastructure/persistence/factories/user-repository.factory.js';
import { AddTeamMemberUseCase } from './application/use-cases/add-team-member.use-case.js';
import { AssignTeamManagerUseCase } from './application/use-cases/assign-team-manager.use-case.js';
import { CreateTeamUseCase } from './application/use-cases/create-team.use-case.js';
import { DeleteTeamUseCase } from './application/use-cases/delete-team.use-case.js';
import { FindTeamUseCase } from './application/use-cases/find-team.use-case.js';
import { ListTeamsUseCase } from './application/use-cases/list-teams.use-case.js';
import { RemoveTeamMemberUseCase } from './application/use-cases/remove-team-member.use-case.js';
import { UpdateTeamUseCase } from './application/use-cases/update-team.use-case.js';
import { TeamFactory } from './domain/factories/team.factory.js';
import { TeamRepositoryFactory } from './infrastructure/persistence/factories/team-repository.factory.js';
import { TeamController } from './presentation/controllers/team.controller.js';

@Module({
	controllers: [TeamController],
	providers: [
		TeamFactory,
		TeamRepositoryFactory,
		StoreRepositoryFactory,
		UserRepositoryFactory,
		CreateTeamUseCase,
		UpdateTeamUseCase,
		AssignTeamManagerUseCase,
		AddTeamMemberUseCase,
		RemoveTeamMemberUseCase,
		FindTeamUseCase,
		ListTeamsUseCase,
		DeleteTeamUseCase,
	],
})
class TeamsModule {}

export { TeamsModule };
