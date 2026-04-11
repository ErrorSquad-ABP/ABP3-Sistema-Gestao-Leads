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
import { StoreResponseDto } from '../../application/dto/store-response.dto.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { CreateStoreUseCase } from '../../application/use-cases/create-store.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { DeleteStoreUseCase } from '../../application/use-cases/delete-store.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { FindStoreUseCase } from '../../application/use-cases/find-store.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { ListStoresUseCase } from '../../application/use-cases/list-stores.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI - tokens em runtime
import { UpdateStoreUseCase } from '../../application/use-cases/update-store.use-case.js';
import { StorePresenter } from '../presenters/store.presenter.js';
// biome-ignore lint/style/useImportType: presenter e validators usados em runtime
import { CreateStoreValidator } from '../validators/create-store.validator.js';
// biome-ignore lint/style/useImportType: presenter e validators usados em runtime
import { UpdateStoreValidator } from '../validators/update-store.validator.js';

const BAD_REQUEST = {
	description:
		'Corpo ou parametros invalidos (falha de validacao do ValidationPipe).',
};

const PATCH_BAD_REQUEST = {
	description:
		'Corpo invalido: falha do ValidationPipe ou nenhum campo enviado para atualizacao (codigo store.update.no_fields).',
};

const SERVER_ERROR = {
	description:
		'Erro interno ou erro de dominio ainda nao mapeado para status HTTP especifico.',
};

@ApiTags('stores')
@Controller('stores')
class StoreController {
	constructor(
		private readonly createStoreUseCase: CreateStoreUseCase,
		private readonly updateStoreUseCase: UpdateStoreUseCase,
		private readonly findStoreUseCase: FindStoreUseCase,
		private readonly listStoresUseCase: ListStoresUseCase,
		private readonly deleteStoreUseCase: DeleteStoreUseCase,
	) {}

	@Post()
	@ApiOperation({
		summary: 'Criar store',
		description:
			'CRUD administrativo de lojas (US-05). Quando RBAC estiver ativo, deve ficar restrito a administrador.',
	})
	@ApiCreatedResponseEnvelope(StoreResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiConflictResponse({
		description:
			'Conflito de negocio relacionado ao contrato da loja, quando aplicavel.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async create(@Body() body: CreateStoreValidator) {
		const store = await this.createStoreUseCase.execute(body);
		return StorePresenter.toResponse(store);
	}

	@Get()
	@ApiOperation({
		summary: 'Listar stores',
		description:
			'Lista as lojas disponiveis para operacao administrativa da US-05.',
	})
	@ApiOkResponseEnvelopeArray(StoreResponseDto)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	list() {
		return this.listStoresUseCase
			.execute()
			.then((stores) => StorePresenter.toResponseList(stores));
	}

	@Get(':id')
	@ApiOperation({ summary: 'Buscar store por id' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(StoreResponseDto)
	@ApiBadRequestResponse({
		description: 'UUID invalido no parametro de rota.',
	})
	@ApiNotFoundResponse({
		description: 'Loja nao encontrada.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async findById(@Param('id', ParseUUIDPipe) id: string) {
		const store = await this.findStoreUseCase.execute(id);
		return StorePresenter.toResponse(store);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Atualizar store' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(StoreResponseDto)
	@ApiBadRequestResponse(PATCH_BAD_REQUEST)
	@ApiNotFoundResponse({
		description: 'Loja nao encontrada.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateStoreValidator,
	) {
		const store = await this.updateStoreUseCase.execute(id, body);
		return StorePresenter.toResponse(store);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Excluir store' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiNoContentResponse({
		description:
			'Store removida (sem corpo JSON; envelope aplicado apenas em respostas com corpo).',
	})
	@ApiBadRequestResponse({
		description: 'UUID invalido no parametro de rota.',
	})
	@ApiNotFoundResponse({
		description: 'Loja nao encontrada.',
	})
	@ApiConflictResponse({
		description:
			'Loja vinculada a leads existentes; exclusao bloqueada por regra de negocio.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.deleteStoreUseCase.execute(id);
	}
}

export { StoreController };
