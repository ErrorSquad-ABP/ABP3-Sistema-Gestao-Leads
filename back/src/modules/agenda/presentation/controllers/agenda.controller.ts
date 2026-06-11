import {
	Body,
	Controller,
	Get,
	Inject,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiExtraModels,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';

import {
	CurrentUser,
	type JwtUser,
} from '../../../auth/presentation/decorators/current-user.decorator.js';
import {
	AgendaItemDto,
	AgendaItemsResponseDto,
	AgendaMetricsDto,
} from '../../application/dto/agenda-item.dto.js';
import { CancelAgendaItemUseCase } from '../../application/use-cases/cancel-agenda-item.use-case.js';
import { CompleteAgendaItemUseCase } from '../../application/use-cases/complete-agenda-item.use-case.js';
import { CreateAgendaItemUseCase } from '../../application/use-cases/create-agenda-item.use-case.js';
import { GetAgendaMetricsUseCase } from '../../application/use-cases/get-agenda-metrics.use-case.js';
import { ListAgendaItemsUseCase } from '../../application/use-cases/list-agenda-items.use-case.js';
import { UpdateAgendaItemUseCase } from '../../application/use-cases/update-agenda-item.use-case.js';
import {
	CreateAgendaItemValidator,
	ListAgendaItemsQueryValidator,
	UpdateAgendaItemValidator,
} from '../validators/agenda-item.validators.js';
import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';

@ApiBearerAuth()
@ApiTags('agenda')
@ApiExtraModels(
	CreateAgendaItemValidator,
	ListAgendaItemsQueryValidator,
	UpdateAgendaItemValidator,
)
@Controller('agenda')
class AgendaController {
	constructor(
		@Inject(ListAgendaItemsUseCase)
		private readonly listAgendaItems: ListAgendaItemsUseCase,
		@Inject(CreateAgendaItemUseCase)
		private readonly createAgendaItem: CreateAgendaItemUseCase,
		@Inject(UpdateAgendaItemUseCase)
		private readonly updateAgendaItem: UpdateAgendaItemUseCase,
		@Inject(CompleteAgendaItemUseCase)
		private readonly completeAgendaItem: CompleteAgendaItemUseCase,
		@Inject(CancelAgendaItemUseCase)
		private readonly cancelAgendaItem: CancelAgendaItemUseCase,
		@Inject(GetAgendaMetricsUseCase)
		private readonly getAgendaMetrics: GetAgendaMetricsUseCase,
	) {}

	@Get('metrics')
	@ApiOperation({ summary: 'Obter metricas da agenda do usuario autenticado' })
	@ApiOkResponse({ type: AgendaMetricsDto })
	async metrics(@CurrentUser() user: JwtUser): Promise<AgendaMetricsDto> {
		return this.getAgendaMetrics.execute(user.userId);
	}

	@Get('items')
	@ApiOperation({ summary: 'Listar itens da agenda do usuário autenticado' })
	@ApiOkResponse({ type: AgendaItemsResponseDto })
	async list(
		@CurrentUser() user: JwtUser,
		@Query() query: ListAgendaItemsQueryValidator,
	): Promise<AgendaItemsResponseDto> {
		return this.listAgendaItems.execute({
			userId: user.userId,
			from: query.from,
			to: query.to,
			type: query.type,
			status: query.status,
			search: query.search,
			limit: query.limit,
		});
	}

	@Post('items')
	@ApiOperation({ summary: 'Criar item na agenda do usuário autenticado' })
	@ApiCreatedResponse({ type: AgendaItemDto })
	async create(
		@CurrentUser() user: JwtUser,
		@Body() body: CreateAgendaItemValidator,
	): Promise<AgendaItemDto> {
		return this.createAgendaItem.execute({
			userId: user.userId,
			type: body.type,
			title: body.title,
			description: body.description,
			location: body.location,
			recurrence: body.recurrence,
			leadId: body.leadId,
			startsAt: body.startsAt,
			endsAt: body.endsAt,
			dueAt: body.dueAt,
			userRole: user.role as UserRole,
		});
	}

	@Patch('items/:id')
	@ApiOperation({ summary: 'Atualizar item da agenda do usuário autenticado' })
	@ApiOkResponse({ type: AgendaItemDto })
	async update(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateAgendaItemValidator,
	): Promise<AgendaItemDto> {
		return this.updateAgendaItem.execute({
			id,
			userId: user.userId,
			type: body.type,
			status: body.status,
			title: body.title,
			description: body.description,
			location: body.location,
			recurrence: body.recurrence,
			leadId: body.leadId,
			startsAt: body.startsAt,
			endsAt: body.endsAt,
			dueAt: body.dueAt,
			userRole: user.role as UserRole,
		});
	}

	@Patch('items/:id/done')
	@ApiOperation({ summary: 'Marcar tarefa da agenda como concluída' })
	@ApiOkResponse({ type: AgendaItemDto })
	async done(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<AgendaItemDto> {
		return this.completeAgendaItem.execute(id, user.userId);
	}

	@Patch('items/:id/cancel')
	@ApiOperation({ summary: 'Cancelar item da agenda' })
	@ApiOkResponse({ type: AgendaItemDto })
	async cancel(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<AgendaItemDto> {
		return this.cancelAgendaItem.execute(id, user.userId);
	}
}

export { AgendaController };
