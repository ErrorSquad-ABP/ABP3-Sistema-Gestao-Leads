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
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';

import {
	ApiCreatedResponseEnvelope,
	ApiOkResponseEnvelope,
	ApiOkResponseEnvelopeArray,
} from '../../../../shared/presentation/swagger/api-success-response.js';
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

@ApiTags('leads')
@Controller('leads')
class LeadController {
	constructor(
		private readonly createLeadUseCase: CreateLeadUseCase,
		private readonly updateLeadUseCase: UpdateLeadUseCase,
		private readonly findLeadUseCase: FindLeadUseCase,
		private readonly listOwnLeadsUseCase: ListOwnLeadsUseCase,
		private readonly listTeamLeadsUseCase: ListTeamLeadsUseCase,
		private readonly reassignLeadUseCase: ReassignLeadUseCase,
		private readonly convertLeadUseCase: ConvertLeadUseCase,
		private readonly deleteLeadUseCase: DeleteLeadUseCase,
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
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	listByOwner(@Param('ownerUserId', ParseUUIDPipe) ownerUserId: string) {
		return this.listOwnLeadsUseCase
			.execute(ownerUserId)
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
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	listByTeam(@Param('teamId', ParseUUIDPipe) teamId: string) {
		return this.listTeamLeadsUseCase
			.execute(teamId)
			.then((leads) => LeadPresenter.toResponseList(leads));
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
