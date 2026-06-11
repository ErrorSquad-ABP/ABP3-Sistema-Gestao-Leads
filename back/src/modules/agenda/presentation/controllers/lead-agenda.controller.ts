import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';

import {
	CurrentUser,
	type JwtUser,
} from '../../../auth/presentation/decorators/current-user.decorator.js';
import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import { AgendaItemsResponseDto } from '../../application/dto/agenda-item.dto.js';
import { ListLeadAgendaItemsUseCase } from '../../application/use-cases/list-lead-agenda-items.use-case.js';

@ApiBearerAuth()
@ApiTags('agenda')
@Controller('leads/:leadId/agenda-items')
class LeadAgendaController {
	constructor(
		@Inject(ListLeadAgendaItemsUseCase)
		private readonly listLeadAgendaItems: ListLeadAgendaItemsUseCase,
	) {}

	@Get()
	@ApiOperation({ summary: 'Listar proximas atividades de agenda do lead' })
	@ApiOkResponse({ type: AgendaItemsResponseDto })
	async list(
		@CurrentUser() user: JwtUser,
		@Param('leadId', ParseUUIDPipe) leadId: string,
	): Promise<AgendaItemsResponseDto> {
		return this.listLeadAgendaItems.execute({
			actor: { userId: user.userId, role: user.role as UserRole },
			leadId,
			userId: user.userId,
		});
	}
}

export { LeadAgendaController };
