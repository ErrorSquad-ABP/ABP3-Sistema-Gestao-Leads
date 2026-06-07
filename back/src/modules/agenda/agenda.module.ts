import { Module } from '@nestjs/common';

import { LeadsModule } from '../leads/leads.module.js';
import { CancelAgendaItemUseCase } from './application/use-cases/cancel-agenda-item.use-case.js';
import { CompleteAgendaItemUseCase } from './application/use-cases/complete-agenda-item.use-case.js';
import { CreateAgendaItemUseCase } from './application/use-cases/create-agenda-item.use-case.js';
import { GetAgendaMetricsUseCase } from './application/use-cases/get-agenda-metrics.use-case.js';
import {
	AGENDA_ITEM_REPOSITORY,
	ListAgendaItemsUseCase,
} from './application/use-cases/list-agenda-items.use-case.js';
import { ListLeadAgendaItemsUseCase } from './application/use-cases/list-lead-agenda-items.use-case.js';
import { UpdateAgendaItemUseCase } from './application/use-cases/update-agenda-item.use-case.js';
import { AgendaPrismaRepository } from './infrastructure/persistence/agenda-prisma.repository.js';
import { AgendaController } from './presentation/controllers/agenda.controller.js';
import { LeadAgendaController } from './presentation/controllers/lead-agenda.controller.js';

@Module({
	imports: [LeadsModule],
	controllers: [AgendaController, LeadAgendaController],
	providers: [
		AgendaPrismaRepository,
		{
			provide: AGENDA_ITEM_REPOSITORY,
			useExisting: AgendaPrismaRepository,
		},
		ListAgendaItemsUseCase,
		GetAgendaMetricsUseCase,
		ListLeadAgendaItemsUseCase,
		CreateAgendaItemUseCase,
		UpdateAgendaItemUseCase,
		CompleteAgendaItemUseCase,
		CancelAgendaItemUseCase,
	],
})
class AgendaModule {}

export { AgendaModule };
