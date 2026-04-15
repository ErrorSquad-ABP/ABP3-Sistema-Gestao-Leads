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
import {
	CurrentUser,
	type JwtUser,
} from '../../../auth/presentation/decorators/current-user.decorator.js';
import { StoreResponseDto } from '../../../stores/application/dto/store-response.dto.js';
import { StorePresenter } from '../../../stores/presentation/presenters/store.presenter.js';
import { LeadCatalogOwnerDto } from '../../application/dto/lead-catalog-owner.dto.js';
import { LeadResponseDto } from '../../application/dto/lead-response.dto.js';
import type { LeadActor } from '../../application/types/lead-actor.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ConvertLeadUseCase } from '../../application/use-cases/convert-lead.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { CreateLeadUseCase } from '../../application/use-cases/create-lead.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { DeleteLeadUseCase } from '../../application/use-cases/delete-lead.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { FindLeadUseCase } from '../../application/use-cases/find-lead.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ListLeadCatalogOwnersUseCase } from '../../application/use-cases/list-lead-catalog-owners.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ListLeadCatalogStoresUseCase } from '../../application/use-cases/list-lead-catalog-stores.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ListAllLeadsUseCase } from '../../application/use-cases/list-all-leads.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ListManagerLeadsUseCase } from '../../application/use-cases/list-manager-leads.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ListOwnLeadsUseCase } from '../../application/use-cases/list-own-leads.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ListTeamLeadsUseCase } from '../../application/use-cases/list-team-leads.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ReassignLeadUseCase } from '../../application/use-cases/reassign-lead.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { UpdateLeadUseCase } from '../../application/use-cases/update-lead.use-case.js';
import { LeadPresenter } from '../presenters/lead.presenter.js';
// biome-ignore lint/style/useImportType: presenter e validators usados em runtime
import { CreateLeadValidator } from '../validators/create-lead.validator.js';
// biome-ignore lint/style/useImportType: presenter e validators usados em runtime
import { ListLeadsQueryValidator } from '../validators/list-leads-query.validator.js';
// biome-ignore lint/style/useImportType: presenter e validators usados em runtime
import { ReassignLeadValidator } from '../validators/reassign-lead.validator.js';
// biome-ignore lint/style/useImportType: presenter e validators usados em runtime
import { UpdateLeadValidator } from '../validators/update-lead.validator.js';

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

@ApiBearerAuth()
@ApiTags('leads')
@Controller('leads')
class LeadController {
	constructor(
		private readonly createLeadUseCase: CreateLeadUseCase,
		private readonly updateLeadUseCase: UpdateLeadUseCase,
		private readonly findLeadUseCase: FindLeadUseCase,
		private readonly listLeadCatalogStoresUseCase: ListLeadCatalogStoresUseCase,
		private readonly listLeadCatalogOwnersUseCase: ListLeadCatalogOwnersUseCase,
		private readonly listOwnLeadsUseCase: ListOwnLeadsUseCase,
		private readonly listTeamLeadsUseCase: ListTeamLeadsUseCase,
		private readonly listAllLeadsUseCase: ListAllLeadsUseCase,
		private readonly listManagerLeadsUseCase: ListManagerLeadsUseCase,
		private readonly reassignLeadUseCase: ReassignLeadUseCase,
		private readonly convertLeadUseCase: ConvertLeadUseCase,
		private readonly deleteLeadUseCase: DeleteLeadUseCase,
	) {}

	@Post()
	@ApiOperation({ summary: 'Criar lead' })
	@ApiCreatedResponseEnvelope(LeadResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async create(
		@CurrentUser() user: JwtUser,
		@Body() body: CreateLeadValidator,
	) {
		const lead = await this.createLeadUseCase.execute(toLeadActor(user), body);
		return LeadPresenter.toResponse(lead);
	}

	@Get('owner/:ownerUserId')
	@ApiOperation({ summary: 'Listar leads por owner (paginado)' })
	@ApiParam({
		name: 'ownerUserId',
		format: 'uuid',
		description: 'Identificador do usuário dono dos leads',
	})
	@ApiOkResponseEnvelopePaged(LeadResponseDto, {
		description:
			'`data.items` com até 10 leads por página; `data.page`, `data.limit`, `data.total`, `data.totalPages`.',
	})
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async listByOwner(
		@CurrentUser() user: JwtUser,
		@Param('ownerUserId', ParseUUIDPipe) ownerUserId: string,
		@Query() query: ListLeadsQueryValidator,
	) {
		const leadPage = await this.listOwnLeadsUseCase.execute(
			toLeadActor(user),
			ownerUserId,
			{ page: query.page, limit: query.limit },
		);
		return {
			items: LeadPresenter.toResponseList([...leadPage.items]),
			page: leadPage.page,
			limit: leadPage.limit,
			total: leadPage.total,
			totalPages: leadPage.totalPages,
		};
	}

	@Get('all')
	@ApiOperation({
		summary: 'Listar todos os leads (alcance global, paginado)',
		description:
			'Reservado a `ADMINISTRATOR` e `GENERAL_MANAGER`. Lista todos os leads do sistema.',
	})
	@ApiOkResponseEnvelopePaged(LeadResponseDto, {
		description:
			'`data.items` com até 10 leads por página; `data.page`, `data.limit`, `data.total`, `data.totalPages`.',
	})
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async listAll(
		@CurrentUser() user: JwtUser,
		@Query() query: ListLeadsQueryValidator,
	) {
		const leadPage = await this.listAllLeadsUseCase.execute(toLeadActor(user), {
			page: query.page,
			limit: query.limit,
		});
		return {
			items: LeadPresenter.toResponseList([...leadPage.items]),
			page: leadPage.page,
			limit: leadPage.limit,
			total: leadPage.total,
			totalPages: leadPage.totalPages,
		};
	}

	@Get('catalog/stores')
	@ApiOperation({
		summary: 'Listar lojas disponíveis para operação de leads',
		description:
			'Retorna apenas as lojas que o utilizador autenticado pode usar no fluxo de leads.',
	})
	@ApiOkResponseEnvelopeArray(StoreResponseDto)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	listCatalogStores(@CurrentUser() user: JwtUser) {
		return this.listLeadCatalogStoresUseCase
			.execute(toLeadActor(user))
			.then((stores) =>
				stores.map((store) => StorePresenter.toResponse(store)),
			);
	}

	@Get('catalog/owners')
	@ApiOperation({
		summary: 'Listar responsáveis disponíveis para operação de leads',
		description:
			'Retorna os utilizadores atribuíveis dentro do escopo do utilizador autenticado, com as lojas em que cada um pode operar.',
	})
	@ApiOkResponseEnvelopeArray(LeadCatalogOwnerDto)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	listCatalogOwners(@CurrentUser() user: JwtUser) {
		return this.listLeadCatalogOwnersUseCase.execute(toLeadActor(user));
	}

	@Get('team/:teamId')
	@ApiOperation({ summary: 'Listar leads por team (paginado)' })
	@ApiParam({
		name: 'teamId',
		format: 'uuid',
		description: 'Identificador do time',
	})
	@ApiOkResponseEnvelopePaged(LeadResponseDto, {
		description:
			'`data.items` com até 10 leads por página; `data.page`, `data.limit`, `data.total`, `data.totalPages`.',
	})
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async listByTeam(
		@CurrentUser() user: JwtUser,
		@Param('teamId', ParseUUIDPipe) teamId: string,
		@Query() query: ListLeadsQueryValidator,
	) {
		const leadPage = await this.listTeamLeadsUseCase.execute(
			toLeadActor(user),
			teamId,
			{ page: query.page, limit: query.limit },
		);
		return {
			items: LeadPresenter.toResponseList([...leadPage.items]),
			page: leadPage.page,
			limit: leadPage.limit,
			total: leadPage.total,
			totalPages: leadPage.totalPages,
		};
	}

	@Get('manager')
	@ApiOperation({
		summary: 'Listar leads do escopo do gestor (paginado)',
		description:
			'Reservado a `MANAGER`. Agrega leads cujo responsável pertence a qualquer equipa visível (membro ou gestor).',
	})
	@ApiOkResponseEnvelopePaged(LeadResponseDto, {
		description:
			'`data.items` com até 10 leads por página; `data.page`, `data.limit`, `data.total`, `data.totalPages`.',
	})
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async listManager(
		@CurrentUser() user: JwtUser,
		@Query() query: ListLeadsQueryValidator,
	) {
		const leadPage = await this.listManagerLeadsUseCase.execute(
			toLeadActor(user),
			{
				page: query.page,
				limit: query.limit,
			},
		);
		return {
			items: LeadPresenter.toResponseList([...leadPage.items]),
			page: leadPage.page,
			limit: leadPage.limit,
			total: leadPage.total,
			totalPages: leadPage.totalPages,
		};
	}

	@Get(':id')
	@ApiOperation({ summary: 'Buscar lead por id' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(LeadResponseDto)
	@ApiBadRequestResponse({
		description: 'UUID inválido no parâmetro de rota.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async findById(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
	) {
		const lead = await this.findLeadUseCase.execute(toLeadActor(user), id);
		return LeadPresenter.toResponse(lead);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Atualizar lead' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(LeadResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async update(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateLeadValidator,
	) {
		const lead = await this.updateLeadUseCase.execute(
			toLeadActor(user),
			id,
			body,
		);
		return LeadPresenter.toResponse(lead);
	}

	@Patch(':id/reassign')
	@ApiOperation({ summary: 'Reatribuir lead' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(LeadResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async reassign(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: ReassignLeadValidator,
	) {
		const lead = await this.reassignLeadUseCase.execute(
			toLeadActor(user),
			id,
			body,
		);
		return LeadPresenter.toResponse(lead);
	}

	@Patch(':id/convert')
	@ApiOperation({
		summary: 'Converter lead',
		description:
			'Marca o lead como CONVERTED. Falha em tempo de execução se o lead já estiver convertido (erro de domínio).',
	})
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(LeadResponseDto)
	@ApiBadRequestResponse({
		description: 'UUID inválido no parâmetro de rota.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async convert(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
	) {
		const lead = await this.convertLeadUseCase.execute(toLeadActor(user), id);
		return LeadPresenter.toResponse(lead);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Excluir lead' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiNoContentResponse({
		description:
			'Lead removido (sem corpo JSON; envelope aplicado apenas em respostas com corpo).',
	})
	@ApiBadRequestResponse({
		description: 'UUID inválido no parâmetro de rota.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async delete(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<void> {
		await this.deleteLeadUseCase.execute(toLeadActor(user), id);
	}
}

export { LeadController };
