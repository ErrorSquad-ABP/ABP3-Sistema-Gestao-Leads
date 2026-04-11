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
	ApiConflictResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';

import {
	ApiCreatedResponseEnvelope,
	ApiOkResponseEnvelope,
	ApiOkResponseEnvelopeArray,
} from '../../../../shared/presentation/swagger/api-success-response.js';
import { TeamResponseDto } from '../../application/dto/team-response.dto.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { CreateTeamUseCase } from '../../application/use-cases/create-team.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { DeleteTeamUseCase } from '../../application/use-cases/delete-team.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { FindTeamUseCase } from '../../application/use-cases/find-team.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { ListTeamsUseCase } from '../../application/use-cases/list-teams.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { UpdateTeamUseCase } from '../../application/use-cases/update-team.use-case.js';
import { TeamPresenter } from '../presenters/team.presenter.js';
// biome-ignore lint/style/useImportType: presenter e validators usados em runtime
import { CreateTeamValidator } from '../validators/create-team.validator.js';
// biome-ignore lint/style/useImportType: presenter e validators usados em runtime
import { UpdateTeamValidator } from '../validators/update-team.validator.js';

const BAD_REQUEST = {
	description:
		'Corpo ou parametros invalidos (falha de validacao do ValidationPipe).',
};

const PATCH_BAD_REQUEST = {
	description:
		'Corpo invalido: falha do ValidationPipe, nenhum campo enviado para atualizacao (codigo team.update.no_fields) ou managerId sem papel compativel de gerencia.',
};

const SERVER_ERROR = {
	description:
		'Erro interno ou erro de dominio ainda nao mapeado para status HTTP especifico.',
};

@ApiTags('teams')
@Controller('teams')
class TeamController {
	constructor(
		private readonly createTeamUseCase: CreateTeamUseCase,
		private readonly updateTeamUseCase: UpdateTeamUseCase,
		private readonly findTeamUseCase: FindTeamUseCase,
		private readonly listTeamsUseCase: ListTeamsUseCase,
		private readonly deleteTeamUseCase: DeleteTeamUseCase,
	) {}

	@Post()
	@ApiOperation({
		summary: 'Criar team',
		description:
			'CRUD administrativo de equipes (US-05). Quando RBAC estiver ativo, deve ficar restrito a administrador.',
	})
	@ApiCreatedResponseEnvelope(TeamResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiConflictResponse({
		description:
			'Conflito de negocio relacionado ao contrato da equipe, quando aplicavel.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async create(@Body() body: CreateTeamValidator) {
		const team = await this.createTeamUseCase.execute(body);
		return TeamPresenter.toResponse(team);
	}

	@Get()
	@ApiOperation({
		summary: 'Listar teams',
		description:
			'Lista as equipes disponiveis para operacao administrativa da US-05.',
	})
	@ApiOkResponseEnvelopeArray(TeamResponseDto)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	list() {
		return this.listTeamsUseCase
			.execute()
			.then((teams) => TeamPresenter.toResponseList(teams));
	}

	@Get(':id')
	@ApiOperation({ summary: 'Buscar team por id' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(TeamResponseDto)
	@ApiBadRequestResponse({
		description: 'UUID invalido no parametro de rota.',
	})
	@ApiNotFoundResponse({
		description: 'Equipe nao encontrada.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async findById(@Param('id', ParseUUIDPipe) id: string) {
		const team = await this.findTeamUseCase.execute(id);
		return TeamPresenter.toResponse(team);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Atualizar team' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(TeamResponseDto)
	@ApiBadRequestResponse(PATCH_BAD_REQUEST)
	@ApiNotFoundResponse({
		description: 'Equipe nao encontrada.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateTeamValidator,
	) {
		const team = await this.updateTeamUseCase.execute(id, body);
		return TeamPresenter.toResponse(team);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Excluir team' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiNoContentResponse({
		description:
			'Team removida (sem corpo JSON; envelope aplicado apenas em respostas com corpo).',
	})
	@ApiBadRequestResponse({
		description: 'UUID invalido no parametro de rota.',
	})
	@ApiNotFoundResponse({
		description: 'Equipe nao encontrada.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.deleteTeamUseCase.execute(id);
	}
}

export { TeamController };
