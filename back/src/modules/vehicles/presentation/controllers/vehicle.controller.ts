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
	ApiNotFoundResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Roles } from '../../../../shared/presentation/decorators/roles.decorator.js';
import {
	ApiCreatedResponseEnvelope,
	ApiOkResponseEnvelope,
	ApiOkResponseEnvelopeArray,
} from '../../../../shared/presentation/swagger/api-success-response.js';
import { VehicleResponseDto } from '../../application/dto/vehicle-response.dto.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { CreateVehicleUseCase } from '../../application/use-cases/create-vehicle.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { DeactivateVehicleUseCase } from '../../application/use-cases/deactivate-vehicle.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { FindVehicleUseCase } from '../../application/use-cases/find-vehicle.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ListVehiclesUseCase } from '../../application/use-cases/list-vehicles.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { UpdateVehicleUseCase } from '../../application/use-cases/update-vehicle.use-case.js';
import { VehiclePresenter } from '../presenters/vehicle.presenter.js';
// biome-ignore lint/style/useImportType: validators usados em runtime
import { CreateVehicleValidator } from '../validators/create-vehicle.validator.js';
// biome-ignore lint/style/useImportType: validators usados em runtime
import { ListVehiclesQueryValidator } from '../validators/list-vehicles-query.validator.js';
// biome-ignore lint/style/useImportType: validators usados em runtime
import { UpdateVehicleValidator } from '../validators/update-vehicle.validator.js';

const BAD_REQUEST = {
	description:
		'Corpo, query ou parâmetros inválidos (falha de validação do ValidationPipe).',
};

const SERVER_ERROR = {
	description:
		'Erro interno ou erro de domínio ainda não mapeado para status HTTP específico.',
};

const UNAUTHORIZED = {
	description: 'Token Bearer ausente ou inválido.',
};

const FORBIDDEN = {
	description:
		'Papel insuficiente: operações do catálogo de veículos exigem ADMINISTRATOR ou GENERAL_MANAGER.',
};

@ApiBearerAuth()
@ApiTags('vehicles')
@ApiUnauthorizedResponse(UNAUTHORIZED)
@ApiForbiddenResponse(FORBIDDEN)
@Roles('ADMINISTRATOR', 'GENERAL_MANAGER')
@Controller('vehicles')
class VehicleController {
	constructor(
		private readonly createVehicleUseCase: CreateVehicleUseCase,
		private readonly updateVehicleUseCase: UpdateVehicleUseCase,
		private readonly findVehicleUseCase: FindVehicleUseCase,
		private readonly listVehiclesUseCase: ListVehiclesUseCase,
		private readonly deactivateVehicleUseCase: DeactivateVehicleUseCase,
	) {}

	@Post()
	@ApiOperation({ summary: 'Criar veículo' })
	@ApiCreatedResponseEnvelope(VehicleResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async create(@Body() body: CreateVehicleValidator) {
		const vehicle = await this.createVehicleUseCase.execute(body);
		return VehiclePresenter.toResponse(vehicle);
	}

	@Get()
	@ApiOperation({ summary: 'Listar veículos (filtro por loja opcional)' })
	@ApiOkResponseEnvelopeArray(VehicleResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async list(@Query() query: ListVehiclesQueryValidator) {
		const vehicles = await this.listVehiclesUseCase.execute({
			storeId: query.storeId,
			status: query.status,
			withoutOpenDeal: query.withoutOpenDeal === 'true',
		});
		return VehiclePresenter.toResponseList([...vehicles]);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Buscar veículo por id' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(VehicleResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiNotFoundResponse({ description: 'Veículo não encontrado.' })
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async findById(@Param('id', ParseUUIDPipe) id: string) {
		const vehicle = await this.findVehicleUseCase.execute(id);
		return VehiclePresenter.toResponse(vehicle);
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Atualizar veículo (campos parciais)',
		description:
			'Não é possível alterar a loja (storeId) após o cadastro; o campo não faz parte do contrato de atualização.',
	})
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(VehicleResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiNotFoundResponse({ description: 'Veículo não encontrado.' })
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateVehicleValidator,
	) {
		const vehicle = await this.updateVehicleUseCase.execute(id, body);
		return VehiclePresenter.toResponse(vehicle);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Inativar veículo (remoção lógica)' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiNoContentResponse({
		description:
			'Veículo inativado (sem corpo JSON; envelope aplicado apenas em respostas com corpo).',
	})
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiNotFoundResponse({ description: 'Veículo não encontrado.' })
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.deactivateVehicleUseCase.execute(id);
	}
}

export { VehicleController };
