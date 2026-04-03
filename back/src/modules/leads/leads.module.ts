import { Module } from '@nestjs/common';

import { CustomerRepositoryFactory } from '../customers/infrastructure/persistence/factories/customer-repository.factory.js';
import { StoreRepositoryFactory } from '../stores/infrastructure/persistence/factories/store-repository.factory.js';
import { UsersModule } from '../users/users.module.js';
import { ConvertLeadUseCase } from './application/use-cases/convert-lead.use-case.js';
import { CreateLeadUseCase } from './application/use-cases/create-lead.use-case.js';
import { DeleteLeadUseCase } from './application/use-cases/delete-lead.use-case.js';
import { FindLeadUseCase } from './application/use-cases/find-lead.use-case.js';
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
	providers: [
		LeadFactory,
		LeadRepositoryFactory,
		CustomerRepositoryFactory,
		StoreRepositoryFactory,
		CreateLeadUseCase,
		UpdateLeadUseCase,
		FindLeadUseCase,
		ListOwnLeadsUseCase,
		ListTeamLeadsUseCase,
		ReassignLeadUseCase,
		ConvertLeadUseCase,
		DeleteLeadUseCase,
	],
})
class LeadsModule {}

export { LeadsModule };
