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
import type { ConvertLeadUseCase } from '../../application/use-cases/convert-lead.use-case.js';
import type { CreateLeadUseCase } from '../../application/use-cases/create-lead.use-case.js';
import type { DeleteLeadUseCase } from '../../application/use-cases/delete-lead.use-case.js';
import type { ReassignLeadUseCase } from '../../application/use-cases/reassign-lead.use-case.js';
import type { UpdateLeadUseCase } from '../../application/use-cases/update-lead.use-case.js';
import { LeadNotFoundError } from '../../domain/errors/lead-not-found.error.js';
import type { LeadDetailsQuery } from '../../infrastructure/queries/lead-details.query.js';
import { LeadPresenter } from '../presenters/lead.presenter.js';
import type { CreateLeadValidator } from '../validators/create-lead.validator.js';
import type { ReassignLeadValidator } from '../validators/reassign-lead.validator.js';
import type { UpdateLeadValidator } from '../validators/update-lead.validator.js';

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
		private readonly reassignLeadUseCase: ReassignLeadUseCase,
		private readonly convertLeadUseCase: ConvertLeadUseCase,
		private readonly deleteLeadUseCase: DeleteLeadUseCase,
		private readonly leadDetailsQuery: LeadDetailsQuery,
	) {}

	@Post()
	@ApiOperation({ summary: 'Criar lead' })
	@ApiCreatedResponseEnvelope(LeadResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async create(@Body() body: CreateLeadValidator) {
		const lead = await this.createLeadUseCase.execute(body);
		return this.loadResponse(lead.id.value);
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
	async listByOwner(@Param('ownerUserId', ParseUUIDPipe) ownerUserId: string) {
		const leads = await this.leadDetailsQuery.listByOwner(ownerUserId);
		return LeadPresenter.toResponseList(leads);
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
	async listByTeam(@Param('teamId', ParseUUIDPipe) teamId: string) {
		const leads = await this.leadDetailsQuery.listByTeam(teamId);
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
		return this.loadResponse(id);
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
		await this.updateLeadUseCase.execute(id, body);
		return this.loadResponse(id);
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
		await this.reassignLeadUseCase.execute(id, body);
		return this.loadResponse(id);
	}

	@Patch(':id/convert')
	@ApiOperation({
		summary: 'Converter lead',
		description:
			'Marca o lead como CONVERTED. Falha em tempo de execução se o lead já estiver convertido.',
	})
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(LeadResponseDto)
	@ApiBadRequestResponse({
		description: 'UUID inválido no parâmetro de rota.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async convert(@Param('id', ParseUUIDPipe) id: string) {
		await this.convertLeadUseCase.execute(id);
		return this.loadResponse(id);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Excluir lead' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiNoContentResponse({
		description: 'Lead removido com sucesso.',
	})
	@ApiBadRequestResponse({
		description: 'UUID inválido no parâmetro de rota.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.deleteLeadUseCase.execute(id);
	}

	private async loadResponse(id: string) {
		const lead = await this.leadDetailsQuery.findById(id);
		if (!lead) {
			throw new LeadNotFoundError(id);
		}
		return LeadPresenter.toResponse(lead);
	}
}

export { LeadController };
