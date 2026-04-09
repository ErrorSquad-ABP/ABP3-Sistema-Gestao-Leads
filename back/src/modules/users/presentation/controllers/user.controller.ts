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
	ApiConflictResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../../../shared/presentation/decorators/roles.decorator.js';
import {
	ApiCreatedResponseEnvelope,
	ApiOkResponseEnvelope,
	ApiOkResponseEnvelopePaged,
} from '../../../../shared/presentation/swagger/api-success-response.js';
import { UserResponseDto } from '../../application/dto/user-response.dto.js';
// biome-ignore lint/style/useImportType: Nest DI
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { FindUserUseCase } from '../../application/use-cases/find-user.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case.js';
import { UserPresenter } from '../presenters/user.presenter.js';
// biome-ignore lint/style/useImportType: validators em runtime
import { CreateUserValidator } from '../validators/create-user.validator.js';
// biome-ignore lint/style/useImportType: validators em runtime
import { ListUsersQueryValidator } from '../validators/list-users-query.validator.js';
// biome-ignore lint/style/useImportType: validators em runtime
import { UpdateUserValidator } from '../validators/update-user.validator.js';

const BAD_REQUEST = {
	description:
		'Corpo ou parâmetros inválidos (falha de validação do ValidationPipe).',
};

const PATCH_BAD_REQUEST = {
	description:
		'Corpo inválido: falha do ValidationPipe ou nenhum campo enviado para atualização (código user.update.no_fields).',
};

const SERVER_ERROR = {
	description:
		'Erro interno ou erro de domínio ainda não mapeado para status HTTP específico.',
};

@ApiBearerAuth()
@ApiTags('users')
@Roles('ADMINISTRATOR')
@Controller('users')
class UserController {
	constructor(
		private readonly createUserUseCase: CreateUserUseCase,
		private readonly listUsersUseCase: ListUsersUseCase,
		private readonly findUserUseCase: FindUserUseCase,
		private readonly updateUserUseCase: UpdateUserUseCase,
		private readonly deleteUserUseCase: DeleteUserUseCase,
	) {}

	@Post()
	@ApiOperation({
		summary: 'Criar usuário',
		description:
			'CRUD administrativo (US-04). Quando RBAC estiver ativo, deve ficar restrito a administrador.',
	})
	@ApiCreatedResponseEnvelope(UserResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiConflictResponse({
		description: 'E-mail já cadastrado.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async create(@Body() body: CreateUserValidator) {
		const user = await this.createUserUseCase.execute({
			name: body.name,
			email: body.email,
			password: body.password,
			role: body.role,
			teamId: body.teamId ?? null,
		});
		return UserPresenter.toResponse(user);
	}

	@Get()
	@ApiOperation({
		summary: 'Listar usuários',
		description:
			'Lista usuários com paginação por página e limite (`page` base 1, `limit` até 100). Proteção por papel administrador será aplicada com RBAC.',
	})
	@ApiOkResponseEnvelopePaged(UserResponseDto, {
		description:
			'Página de usuários: `data.items`, `data.page`, `data.limit`, `data.total`, `data.totalPages` (0 se não houver registros).',
	})
	@ApiBadRequestResponse({
		description:
			'Query inválida: `page` ou `limit` fora dos intervalos permitidos (ex.: limit > 100).',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async list(@Query() query: ListUsersQueryValidator) {
		const result = await this.listUsersUseCase.execute({
			page: query.page,
			limit: query.limit,
		});
		return {
			items: UserPresenter.toResponseList(result.users),
			page: result.page,
			limit: result.limit,
			total: result.total,
			totalPages: result.totalPages,
		};
	}

	@Get(':id')
	@ApiOperation({ summary: 'Buscar usuário por id' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(UserResponseDto)
	@ApiBadRequestResponse({
		description: 'UUID inválido no parâmetro de rota.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async findById(@Param('id', ParseUUIDPipe) id: string) {
		const user = await this.findUserUseCase.execute(id);
		return UserPresenter.toResponse(user);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Atualizar usuário' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(UserResponseDto)
	@ApiBadRequestResponse(PATCH_BAD_REQUEST)
	@ApiConflictResponse({
		description: 'E-mail já usado por outro usuário.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateUserValidator,
	) {
		const user = await this.updateUserUseCase.execute(id, body);
		return UserPresenter.toResponse(user);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Excluir usuário' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiNoContentResponse({
		description:
			'Usuário removido (sem corpo JSON; envelope aplicado apenas em respostas com corpo).',
	})
	@ApiBadRequestResponse({
		description: 'UUID inválido no parâmetro de rota.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.deleteUserUseCase.execute(id);
	}
}

export { UserController };
