import { Module } from '@nestjs/common';

import { CancelAgendaItemUseCase } from './application/use-cases/cancel-agenda-item.use-case.js';
import { CompleteAgendaItemUseCase } from './application/use-cases/complete-agenda-item.use-case.js';
import { CreateAgendaItemUseCase } from './application/use-cases/create-agenda-item.use-case.js';
import {
	AGENDA_ITEM_REPOSITORY,
	ListAgendaItemsUseCase,
} from './application/use-cases/list-agenda-items.use-case.js';
import { UpdateAgendaItemUseCase } from './application/use-cases/update-agenda-item.use-case.js';
import { AgendaPrismaRepository } from './infrastructure/persistence/agenda-prisma.repository.js';
import { AgendaController } from './presentation/controllers/agenda.controller.js';

@Module({
	controllers: [AgendaController],
	providers: [
		AgendaPrismaRepository,
		{
			provide: AGENDA_ITEM_REPOSITORY,
			useExisting: AgendaPrismaRepository,
		},
		ListAgendaItemsUseCase,
		CreateAgendaItemUseCase,
		UpdateAgendaItemUseCase,
		CompleteAgendaItemUseCase,
		CancelAgendaItemUseCase,
	],
})
class AgendaModule {}

export { AgendaModule };
