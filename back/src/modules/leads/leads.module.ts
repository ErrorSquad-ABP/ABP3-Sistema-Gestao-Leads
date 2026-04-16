import { Module } from '@nestjs/common';

import { CustomerRepositoryFactory } from '../customers/infrastructure/persistence/factories/customer-repository.factory.js';
import { StoreRepositoryFactory } from '../stores/infrastructure/persistence/factories/store-repository.factory.js';
import { TeamRepositoryFactory } from '../teams/infrastructure/persistence/factories/team-repository.factory.js';
import { UsersModule } from '../users/users.module.js';
import { UserRepositoryFactory } from '../users/infrastructure/persistence/factories/user-repository.factory.js';
import { LeadAccessPolicy } from './application/services/lead-access-policy.service.js';
import { ConvertLeadUseCase } from './application/use-cases/convert-lead.use-case.js';
import { CreateLeadUseCase } from './application/use-cases/create-lead.use-case.js';
import { DeleteLeadUseCase } from './application/use-cases/delete-lead.use-case.js';
import { FindLeadUseCase } from './application/use-cases/find-lead.use-case.js';
import { ListLeadCatalogOwnersUseCase } from './application/use-cases/list-lead-catalog-owners.use-case.js';
import { ListLeadCatalogStoresUseCase } from './application/use-cases/list-lead-catalog-stores.use-case.js';
import { ListAllLeadsUseCase } from './application/use-cases/list-all-leads.use-case.js';
import { ListManagerLeadsUseCase } from './application/use-cases/list-manager-leads.use-case.js';
import { ListOwnLeadsUseCase } from './application/use-cases/list-own-leads.use-case.js';
import { ListTeamLeadsUseCase } from './application/use-cases/list-team-leads.use-case.js';
import { ReassignLeadUseCase } from './application/use-cases/reassign-lead.use-case.js';
import { UpdateLeadUseCase } from './application/use-cases/update-lead.use-case.js';
import { LeadFactory } from './domain/factories/lead.factory.js';
import { LeadRepositoryFactory } from './infrastructure/persistence/factories/lead-repository.factory.js';
import { LeadController } from './presentation/controllers/lead.controller.js';

@Module({
	imports: [UsersModule],
	controllers: [LeadController],
	exports: [LeadAccessPolicy, LeadRepositoryFactory],
	providers: [
		LeadAccessPolicy,
		LeadFactory,
		LeadRepositoryFactory,
		CustomerRepositoryFactory,
		StoreRepositoryFactory,
		TeamRepositoryFactory,
		UserRepositoryFactory,
		CreateLeadUseCase,
		UpdateLeadUseCase,
		FindLeadUseCase,
		ListLeadCatalogStoresUseCase,
		ListLeadCatalogOwnersUseCase,
		ListOwnLeadsUseCase,
		ListTeamLeadsUseCase,
		ListAllLeadsUseCase,
		ListManagerLeadsUseCase,
		ReassignLeadUseCase,
		ConvertLeadUseCase,
		DeleteLeadUseCase,
	],
})
class LeadsModule {}

export { LeadsModule };
