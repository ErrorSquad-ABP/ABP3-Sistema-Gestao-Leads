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
	UseGuards,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiConflictResponse,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
	CurrentUser,
	type JwtUser,
} from '../../../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../../auth/roles.guard.js';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator.js';
import {
	ApiCreatedResponseEnvelope,
	ApiOkResponseEnvelope,
	ApiOkResponseEnvelopeArray,
} from '../../../../shared/presentation/swagger/api-success-response.js';
import { TeamResponseDto } from '../../application/dto/team-response.dto.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { AddTeamMemberUseCase } from '../../application/use-cases/add-team-member.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { AssignTeamManagerUseCase } from '../../application/use-cases/assign-team-manager.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { CreateTeamUseCase } from '../../application/use-cases/create-team.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { DeleteTeamUseCase } from '../../application/use-cases/delete-team.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { FindTeamUseCase } from '../../application/use-cases/find-team.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { ListTeamsUseCase } from '../../application/use-cases/list-teams.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { RemoveTeamMemberUseCase } from '../../application/use-cases/remove-team-member.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { UpdateTeamUseCase } from '../../application/use-cases/update-team.use-case.js';
import { TeamPresenter } from '../presenters/team.presenter.js';
// biome-ignore lint/style/useImportType: presenter e validators usados em runtime
import { AddTeamMemberValidator } from '../validators/add-team-member.validator.js';
// biome-ignore lint/style/useImportType: presenter e validators usados em runtime
import { AssignTeamManagerValidator } from '../validators/assign-team-manager.validator.js';
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
		'Corpo invalido: falha do ValidationPipe, nenhum campo enviado para atualizacao (codigo team.update.no_fields) ou storeId inexistente.',
};

const SERVER_ERROR = {
	description:
		'Erro interno ou erro de dominio ainda nao mapeado para status HTTP especifico.',
};

const UNAUTHORIZED = {
	description: 'Token Bearer ausente ou invalido.',
};

const FORBIDDEN = {
	description:
		'Papel insuficiente ou fora do escopo da loja/equipe (MANAGER so atua nas equipes que gerencia e nas lojas ja vinculadas).',
};

@ApiBearerAuth('access-token')
@ApiTags('teams')
@ApiUnauthorizedResponse(UNAUTHORIZED)
@ApiForbiddenResponse(FORBIDDEN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR')
@Controller('teams')
class TeamController {
	constructor(
		private readonly createTeamUseCase: CreateTeamUseCase,
		private readonly updateTeamUseCase: UpdateTeamUseCase,
		private readonly assignTeamManagerUseCase: AssignTeamManagerUseCase,
		private readonly addTeamMemberUseCase: AddTeamMemberUseCase,
		private readonly removeTeamMemberUseCase: RemoveTeamMemberUseCase,
		private readonly findTeamUseCase: FindTeamUseCase,
		private readonly listTeamsUseCase: ListTeamsUseCase,
		private readonly deleteTeamUseCase: DeleteTeamUseCase,
	) {}

	@Post()
	@ApiOperation({
		summary: 'Criar team',
		description:
			'CRUD de equipes (US-05) para perfis de gestão. Loja obrigatoria; gerente da equipe e membros iniciais opcionais.',
	})
	@ApiCreatedResponseEnvelope(TeamResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiConflictResponse({
		description:
			'Conflito de negocio relacionado ao contrato da equipe, quando aplicavel.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async create(
		@CurrentUser() user: JwtUser,
		@Body() body: CreateTeamValidator,
	) {
		const team = await this.createTeamUseCase.execute(
			{ userId: user.sub, role: user.role },
			{
				name: body.name,
				storeId: body.storeId,
				managerId: body.managerId ?? null,
				initialMemberUserIds: body.initialMemberUserIds,
			},
		);
		return TeamPresenter.toResponse(team);
	}

	@Get()
	@ApiOperation({
		summary: 'Listar teams',
		description:
			'Lista equipes (US-05) para utilizadores com papel de gestão na loja/equipes.',
	})
	@ApiOkResponseEnvelopeArray(TeamResponseDto)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	list(@CurrentUser() user: JwtUser) {
		return this.listTeamsUseCase
			.execute({ userId: user.sub, role: user.role })
			.then((teams) => TeamPresenter.toResponseList(teams));
	}

	@Patch(':id/manager')
	@ApiOperation({
		summary: 'Definir ou remover gerente da equipe',
		description:
			'Atualiza apenas a relacao TeamManager (independente dos membros).',
	})
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(TeamResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiNotFoundResponse({
		description: 'Equipe ou usuario gerente nao encontrado.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async assignManager(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: AssignTeamManagerValidator,
	) {
		const team = await this.assignTeamManagerUseCase.execute(
			{ userId: user.sub, role: user.role },
			id,
			body.managerId,
		);
		return TeamPresenter.toResponse(team);
	}

	@Post(':id/members')
	@ApiOperation({
		summary: 'Adicionar membro a equipe',
		description: 'Conecta um usuario como membro (relação TeamMembers).',
	})
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(TeamResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiNotFoundResponse({
		description: 'Equipe ou usuario nao encontrado.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async addMember(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: AddTeamMemberValidator,
	) {
		const team = await this.addTeamMemberUseCase.execute(
			{ userId: user.sub, role: user.role },
			id,
			{
				userId: body.userId,
			},
		);
		return TeamPresenter.toResponse(team);
	}

	@Delete(':id/members/:userId')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Remover membro da equipe',
		description: 'Desconecta o usuario da lista de membros.',
	})
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiParam({ name: 'userId', format: 'uuid' })
	@ApiOkResponseEnvelope(TeamResponseDto)
	@ApiBadRequestResponse({
		description: 'UUID invalido no parametro de rota.',
	})
	@ApiNotFoundResponse({
		description: 'Equipe nao encontrada.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async removeMember(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
		@Param('userId', ParseUUIDPipe) memberUserId: string,
	) {
		const team = await this.removeTeamMemberUseCase.execute(
			{ userId: user.sub, role: user.role },
			id,
			memberUserId,
		);
		return TeamPresenter.toResponse(team);
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
	async findById(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
	) {
		const team = await this.findTeamUseCase.execute(
			{ userId: user.sub, role: user.role },
			id,
		);
		return TeamPresenter.toResponse(team);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Atualizar nome e/ou loja do team' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(TeamResponseDto)
	@ApiBadRequestResponse(PATCH_BAD_REQUEST)
	@ApiNotFoundResponse({
		description: 'Equipe nao encontrada.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async update(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateTeamValidator,
	) {
		const team = await this.updateTeamUseCase.execute(
			{ userId: user.sub, role: user.role },
			id,
			body,
		);
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
	async delete(
		@CurrentUser() user: JwtUser,
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<void> {
		await this.deleteTeamUseCase.execute(
			{ userId: user.sub, role: user.role },
			id,
		);
	}
}

export { TeamController };
