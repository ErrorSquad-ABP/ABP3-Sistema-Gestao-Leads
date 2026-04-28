import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';

import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import {
	ApiCreatedResponseEnvelope,
	ApiOkResponseEnvelope,
	ApiOkResponseEnvelopeArray,
	ApiOkResponseEnvelopePaged,
} from '../../../../shared/presentation/swagger/api-success-response.js';
import type { DealImportance } from '../../../../shared/domain/enums/deal-importance.enum.js';
import {
	CurrentUser,
	type JwtUser,
} from '../../../auth/presentation/decorators/current-user.decorator.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import {
	DealPipelineResponseDto,
	DealPipelineStageDto,
} from '../../application/dto/deal-pipeline-response.dto.js';
import { DealsByLeadListDto } from '../../application/dto/deals-by-lead-list.dto.js';
import { DealHistoryItemDto } from '../../application/dto/deal-history-response.dto.js';
import { DealResponseDto } from '../../application/dto/deal-response.dto.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { CreateDealUseCase } from '../../application/use-cases/create-deal.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { DeleteDealUseCase } from '../../application/use-cases/delete-deal.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { FindDealUseCase } from '../../application/use-cases/find-deal.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ListDealHistoryUseCase } from '../../application/use-cases/list-deal-history.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ListDealPipelineUseCase } from '../../application/use-cases/list-deal-pipeline.use-case.js';
import type { DealPipelineStageResult } from '../../application/use-cases/list-deal-pipeline.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ListDealsUseCase } from '../../application/use-cases/list-deals.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ListDealsByLeadUseCase } from '../../application/use-cases/list-deals-by-lead.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { UpdateDealUseCase } from '../../application/use-cases/update-deal.use-case.js';
import { DealPresenter } from '../presenters/deal.presenter.js';
// biome-ignore lint/style/useImportType: validators usados em runtime
import { CreateDealValidator } from '../validators/create-deal.validator.js';
// biome-ignore lint/style/useImportType: validators usados em runtime
import { ListDealPipelineQueryValidator } from '../validators/list-deal-pipeline-query.validator.js';
// biome-ignore lint/style/useImportType: validators usados em runtime
import { ListDealPipelineStageQueryValidator } from '../validators/list-deal-pipeline-stage-query.validator.js';
// biome-ignore lint/style/useImportType: validators usados em runtime
import { ListDealsQueryValidator } from '../validators/list-deals-query.validator.js';
// biome-ignore lint/style/useImportType: validators usados em runtime
import { UpdateDealValidator } from '../validators/update-deal.validator.js';

const BAD_REQUEST = {
	description:
		'Corpo ou parâmetros inválidos (falha de validação do ValidationPipe).',
};

const SERVER_ERROR = {
	description:
		'Erro interno ou erro de domínio ainda não mapeado para status HTTP específico.',
};

const FORBIDDEN = {
	description:
		'Utilizador autenticado sem permissão para o recurso ou parâmetro solicitado.',
};

function toLeadActor(user: JwtUser): LeadActor {
	return {
		userId: user.userId,
		role: user.role as UserRole,
	};
}

function toPipelineStageResponse(
	stage: DealPipelineStageResult,
): DealPipelineStageDto {
	return {
		key: stage.key,
		label: stage.label,
		count: stage.count,
		totalValue: stage.totalValue,
		page: stage.page,
		pageSize: stage.pageSize,
		totalPages: stage.totalPages,
		hasNextPage: stage.hasNextPage,
		items: DealPresenter.toResponseListEnriched([...stage.items]),
	};
}

@ApiBearerAuth()
@ApiTags('deals')
@Controller()
class DealController {
	constructor(
		private readonly createDealUseCase: CreateDealUseCase,
		private readonly updateDealUseCase: UpdateDealUseCase,
		private readonly findDealUseCase: FindDealUseCase,
		private readonly listDealsUseCase: ListDealsUseCase,
		private readonly listDealsByLeadUseCase: ListDealsByLeadUseCase,
		private readonly listDealHistoryUseCase: ListDealHistoryUseCase,
		private readonly listDealPipelineUseCase: ListDealPipelineUseCase,
		private readonly deleteDealUseCase: DeleteDealUseCase,
	) {}

	@Post('leads/:leadId/deals')
	@ApiOperation({ summary: 'Criar negociação para o lead' })
	@ApiParam({ name: 'leadId', format: 'uuid' })
	@ApiCreatedResponseEnvelope(DealResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async create(
		@CurrentUser() user: JwtUser,
		@Param('leadId', ParseUUIDPipe) leadId: string,
		@Body() body: CreateDealValidator,
	) {
		const created = await this.createDealUseCase.execute(
			toLeadActor(user),
			leadId,
			{
				vehicleId: body.vehicleId,
				title: body.title,
				value: body.value ?? null,
				importance: body.importance,
				stage: body.stage,
			},
		);
		const deal = await this.findDealUseCase.execute(
			toLeadActor(user),
			created.id.value,
		);
		return DealPresenter.toResponseEnriched(deal.row, deal.canMutate);
	}

	@Get('leads/:leadId/deals')
	@ApiOperation({ summary: 'Listar negociações do lead' })
	@ApiParam({ name: 'leadId', format: 'uuid' })
	@ApiOkResponseEnvelope(DealsByLeadListDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async listByLead(
		@CurrentUser() user: JwtUser,
		@Param('leadId', ParseUUIDPipe) leadId: string,
	) {
		const result = await this.listDealsByLeadUseCase.execute(
			toLeadActor(user),
			leadId,
		);
		return {
			items: DealPresenter.toResponseListEnriched(result.items),
			canMutateLead: result.canMutateLead,
		};
	}

	@Get('deals')
	@ApiOperation({
		summary: 'Listar negociações (escopo automático por papel)',
		description:
			'ATTENDANT: próprias negociações. MANAGER: negociações das stores do escopo do gestor. GENERAL_MANAGER: negociações por stores do escopo. ADMINISTRATOR: global.',
	})
	@ApiOkResponseEnvelopePaged(DealResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async list(
		@CurrentUser() user: JwtUser,
		@Query() query: ListDealsQueryValidator,
	) {
		const page = await this.listDealsUseCase.execute(toLeadActor(user), {
			storeId: query.storeId,
			ownerUserId: query.ownerUserId,
			status: query.status as 'OPEN' | 'WON' | 'LOST' | undefined,
			page: query.page,
			limit: query.limit,
		});

		return {
			items: DealPresenter.toResponseListEnriched([...page.items]),
			page: page.page,
			limit: page.limit,
			total: page.total,
			totalPages: page.totalPages,
		};
	}

	@Get('deals/pipeline')
	@ApiOperation({
		summary: 'Listar pipeline de negociações paginado por etapa',
		description:
			'Retorna as etapas do funil com a primeira página de itens, total de negociações e soma total por etapa.',
	})
	@ApiOkResponseEnvelope(DealPipelineResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async pipeline(
		@CurrentUser() user: JwtUser,
		@Query() query: ListDealPipelineQueryValidator,
	): Promise<DealPipelineResponseDto> {
		const result = await this.listDealPipelineUseCase.execute(
			toLeadActor(user),
			{
				status: query.status as 'OPEN' | 'WON' | 'LOST' | undefined,
				importance: query.importance as DealImportance | undefined,
				search: query.search,
				pageSize: query.pageSize,
			},
		);

		return {
			stages: result.stages.map(toPipelineStageResponse),
		};
	}

	@Get('deals/pipeline/stages/:stage')
	@ApiOperation({
		summary: 'Listar página de uma etapa do pipeline de negociações',
	})
	@ApiParam({
		name: 'stage',
		enum: ['INITIAL_CONTACT', 'NEGOTIATION', 'PROPOSAL', 'CLOSING'],
	})
	@ApiOkResponseEnvelope(DealPipelineStageDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async pipelineStage(
		@CurrentUser() user: JwtUser,
		@Param('stage') stage: string,
		@Query() query: ListDealPipelineStageQueryValidator,
	): Promise<DealPipelineStageDto> {
		const result = await this.listDealPipelineUseCase.executeStage(
			toLeadActor(user),
			{
				stage,
				status: query.status as 'OPEN' | 'WON' | 'LOST' | undefined,
				importance: query.importance as DealImportance | undefined,
				search: query.search,
				page: query.page,
				pageSize: query.pageSize,
			},
		);

		return toPipelineStageResponse(result);
	}

	@Get('deals/:id/history')
	@ApiOperation({ summary: 'Histórico de alterações da negociação' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelopeArray(DealHistoryItemDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async history(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
	) {
		const rows = await this.listDealHistoryUseCase.execute(
			toLeadActor(user),
			id,
		);
		return DealPresenter.toHistoryList([...rows]);
	}

	@Get('deals/:id')
	@ApiOperation({ summary: 'Obter negociação por id' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(DealResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async findById(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
	) {
		const deal = await this.findDealUseCase.execute(toLeadActor(user), id);
		return DealPresenter.toResponseEnriched(deal.row, deal.canMutate);
	}

	@Patch('deals/:id')
	@ApiOperation({ summary: 'Atualizar negociação (campos parciais)' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(DealResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async update(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateDealValidator,
	) {
		await this.updateDealUseCase.execute(toLeadActor(user), id, {
			vehicleId: body.vehicleId,
			title: body.title,
			value: body.value,
			importance: body.importance,
			stage: body.stage,
			status: body.status,
		});
		const deal = await this.findDealUseCase.execute(toLeadActor(user), id);
		return DealPresenter.toResponseEnriched(deal.row, deal.canMutate);
	}

	@Delete('deals/:id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Excluir negociação' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiNoContentResponse({
		description:
			'Negociação removida (sem corpo JSON; envelope aplicado apenas em respostas com corpo).',
	})
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async delete(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<void> {
		await this.deleteDealUseCase.execute(toLeadActor(user), id);
	}
}

export { DealController };
