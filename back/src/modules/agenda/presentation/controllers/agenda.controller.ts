import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiCreatedResponse,
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
} from '../../application/dto/agenda-item.dto.js';
// biome-ignore lint/style/useImportType: Nest DI
import { CancelAgendaItemUseCase } from '../../application/use-cases/cancel-agenda-item.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { CompleteAgendaItemUseCase } from '../../application/use-cases/complete-agenda-item.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { CreateAgendaItemUseCase } from '../../application/use-cases/create-agenda-item.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { ListAgendaItemsUseCase } from '../../application/use-cases/list-agenda-items.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UpdateAgendaItemUseCase } from '../../application/use-cases/update-agenda-item.use-case.js';
// biome-ignore lint/style/useImportType: validators usados em runtime pelo Nest
import {
	CreateAgendaItemValidator,
	ListAgendaItemsQueryValidator,
	UpdateAgendaItemValidator,
} from '../validators/agenda-item.validators.js';

@ApiBearerAuth()
@ApiTags('agenda')
@Controller('agenda')
class AgendaController {
	constructor(
		private readonly listAgendaItems: ListAgendaItemsUseCase,
		private readonly createAgendaItem: CreateAgendaItemUseCase,
		private readonly updateAgendaItem: UpdateAgendaItemUseCase,
		private readonly completeAgendaItem: CompleteAgendaItemUseCase,
		private readonly cancelAgendaItem: CancelAgendaItemUseCase,
	) {}

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
			startsAt: body.startsAt,
			endsAt: body.endsAt,
			dueAt: body.dueAt,
		});
	}

	@Patch('items/:id')
	@ApiOperation({ summary: 'Atualizar item da agenda do usuário autenticado' })
	@ApiOkResponse({ type: AgendaItemDto })
	async update(
		@CurrentUser() user: JwtUser,
		@Param('id') id: string,
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
			startsAt: body.startsAt,
			endsAt: body.endsAt,
			dueAt: body.dueAt,
		});
	}

	@Patch('items/:id/done')
	@ApiOperation({ summary: 'Marcar tarefa da agenda como concluída' })
	@ApiOkResponse({ type: AgendaItemDto })
	async done(
		@CurrentUser() user: JwtUser,
		@Param('id') id: string,
	): Promise<AgendaItemDto> {
		return this.completeAgendaItem.execute(id, user.userId);
	}

	@Patch('items/:id/cancel')
	@ApiOperation({ summary: 'Cancelar item da agenda' })
	@ApiOkResponse({ type: AgendaItemDto })
	async cancel(
		@CurrentUser() user: JwtUser,
		@Param('id') id: string,
	): Promise<AgendaItemDto> {
		return this.cancelAgendaItem.execute(id, user.userId);
	}
}

export { AgendaController };
