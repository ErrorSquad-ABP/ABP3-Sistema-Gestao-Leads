import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
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
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import {
	ApiCreatedResponseEnvelope,
	ApiOkResponseEnvelope,
	ApiOkResponseEnvelopeArray,
} from '../../../../shared/presentation/swagger/api-success-response.js';
import {
	CurrentUser,
	type JwtUser,
} from '../../../auth/presentation/decorators/current-user.decorator.js';
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import { LeadResponseDto } from '../../application/dto/lead-response.dto.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ConvertLeadUseCase } from '../../application/use-cases/convert-lead.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { CreateLeadUseCase } from '../../application/use-cases/create-lead.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { DeleteLeadUseCase } from '../../application/use-cases/delete-lead.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { FindLeadUseCase } from '../../application/use-cases/find-lead.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ListAllLeadsUseCase } from '../../application/use-cases/list-all-leads.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ListOwnLeadsUseCase } from '../../application/use-cases/list-own-leads.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ListTeamLeadsUseCase } from '../../application/use-cases/list-team-leads.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ReassignLeadUseCase } from '../../application/use-cases/reassign-lead.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { UpdateLeadUseCase } from '../../application/use-cases/update-lead.use-case.js';
import { LeadPresenter } from '../presenters/lead.presenter.js';
import {
	requireListAllLeadsAllowed,
	requireListByOwnerAllowed,
	requireListByTeamAllowed,
} from '../utils/lead-list-access.util.js';
// biome-ignore lint/style/useImportType: presenter e validators usados em runtime
import { CreateLeadValidator } from '../validators/create-lead.validator.js';
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

@ApiBearerAuth()
@ApiTags('leads')
@Controller('leads')
class LeadController {
	constructor(
		private readonly createLeadUseCase: CreateLeadUseCase,
		private readonly updateLeadUseCase: UpdateLeadUseCase,
		private readonly findLeadUseCase: FindLeadUseCase,
		private readonly listOwnLeadsUseCase: ListOwnLeadsUseCase,
		private readonly listTeamLeadsUseCase: ListTeamLeadsUseCase,
		private readonly listAllLeadsUseCase: ListAllLeadsUseCase,
		private readonly reassignLeadUseCase: ReassignLeadUseCase,
		private readonly convertLeadUseCase: ConvertLeadUseCase,
		private readonly deleteLeadUseCase: DeleteLeadUseCase,
		@Inject(UserRepositoryFactory)
		private readonly userRepositoryFactory: UserRepositoryFactory,
	) {}

	@Post()
	@ApiOperation({ summary: 'Criar lead' })
	@ApiCreatedResponseEnvelope(LeadResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async create(@Body() body: CreateLeadValidator) {
		const lead = await this.createLeadUseCase.execute(body);
		return LeadPresenter.toResponse(lead);
	}

	@Get('owner/:ownerUserId')
	@ApiOperation({ summary: 'Listar leads por owner' })
	@ApiParam({
		name: 'ownerUserId',
		format: 'uuid',
		description: 'Identificador do usuário dono dos leads',
	})
	@ApiOkResponseEnvelopeArray(LeadResponseDto)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	listByOwner(
		@CurrentUser() current: JwtUser,
		@Param('ownerUserId', ParseUUIDPipe) ownerUserId: string,
	) {
		requireListByOwnerAllowed(current.userId, ownerUserId);
		return this.listOwnLeadsUseCase
			.execute(ownerUserId)
			.then((leads) => LeadPresenter.toResponseList(leads));
	}

	@Get('all')
	@ApiOperation({
		summary: 'Listar todos os leads (alcance global)',
		description:
			'Reservado a `ADMINISTRATOR`. Lista todos os leads do sistema, sem filtro por equipa ou owner.',
	})
	@ApiOkResponseEnvelopeArray(LeadResponseDto)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	listAll(@CurrentUser() current: JwtUser) {
		requireListAllLeadsAllowed(current.role);
		return this.listAllLeadsUseCase
			.execute()
			.then((leads) => LeadPresenter.toResponseList(leads));
	}

	@Get('team/:teamId')
	@ApiOperation({ summary: 'Listar leads por team' })
	@ApiParam({
		name: 'teamId',
		format: 'uuid',
		description: 'Identificador do time',
	})
	@ApiOkResponseEnvelopeArray(LeadResponseDto)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async listByTeam(
		@CurrentUser() current: JwtUser,
		@Param('teamId', ParseUUIDPipe) teamId: string,
	) {
		const users = this.userRepositoryFactory.create();
		const user = await users.findById(Uuid.parse(current.userId));
		const teamIdValue = user?.teamId?.value ?? null;
		requireListByTeamAllowed(current.role, teamIdValue, teamId);
		const leads = await this.listTeamLeadsUseCase.execute(teamId);
		return LeadPresenter.toResponseList(leads);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Buscar lead por id' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(LeadResponseDto)
	@ApiBadRequestResponse({
		description: 'UUID inválido no parâmetro de rota.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async findById(@Param('id', ParseUUIDPipe) id: string) {
		const lead = await this.findLeadUseCase.execute(id);
		return LeadPresenter.toResponse(lead);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Atualizar lead' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(LeadResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateLeadValidator,
	) {
		const lead = await this.updateLeadUseCase.execute(id, body);
		return LeadPresenter.toResponse(lead);
	}

	@Patch(':id/reassign')
	@ApiOperation({ summary: 'Reatribuir lead' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(LeadResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async reassign(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: ReassignLeadValidator,
	) {
		const lead = await this.reassignLeadUseCase.execute(id, body);
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
	async convert(@Param('id', ParseUUIDPipe) id: string) {
		const lead = await this.convertLeadUseCase.execute(id);
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
	async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.deleteLeadUseCase.execute(id);
	}
}

export { LeadController };
