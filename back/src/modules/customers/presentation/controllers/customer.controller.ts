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
import { CustomerResponseDto } from '../../application/dto/customer-response.dto.js';
// biome-ignore lint/style/useImportType: Nest DI
import { CreateCustomerUseCase } from '../../application/use-cases/create-customer.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { DeleteCustomerUseCase } from '../../application/use-cases/delete-customer.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { FindCustomerUseCase } from '../../application/use-cases/find-customer.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { ListCustomersUseCase } from '../../application/use-cases/list-customers.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UpdateCustomerUseCase } from '../../application/use-cases/update-customer.use-case.js';
import { CustomerPresenter } from '../presenters/customer.presenter.js';
import type { CreateCustomerValidated } from '../validators/create-customer.validator.js';
import { CreateCustomerValidator } from '../validators/create-customer.validator.js';
import type { UpdateCustomerValidated } from '../validators/update-customer.validator.js';
import { UpdateCustomerValidator } from '../validators/update-customer.validator.js';

const BAD_REQUEST = {
	description:
		'Corpo ou parâmetros inválidos (falha de validação do ValidationPipe).',
};

const CONFLICT = {
	description:
		'Conflito de integridade: email ou CPF já existem na base de dados.',
};

const NOT_FOUND = {
	description: 'Cliente não encontrado (código: customer.not_found).',
};

const SERVER_ERROR = {
	description: 'Erro interno do servidor.',
};

@ApiTags('customers')
@Controller('customers')
class CustomerController {
	constructor(
		private readonly createCustomerUseCase: CreateCustomerUseCase,
		private readonly updateCustomerUseCase: UpdateCustomerUseCase,
		private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
		private readonly findCustomerUseCase: FindCustomerUseCase,
		private readonly listCustomersUseCase: ListCustomersUseCase,
	) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Criar novo cliente',
		description: 'Cria um novo cliente com os dados fornecidos.',
	})
	@ApiCreatedResponseEnvelope(CustomerResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiConflictResponse(CONFLICT)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async create(@Body(CreateCustomerValidator) body: CreateCustomerValidated) {
		const customer = await this.createCustomerUseCase.execute({
			name: body.name,
			email: body.email ?? null,
			phone: body.phone ?? null,
			cpf: body.cpf ?? null,
		});

		return {
			data: CustomerPresenter.toResponse(customer),
		};
	}

	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Listar clientes',
		description: 'Retorna a lista de todos os clientes cadastrados.',
	})
	@ApiOkResponseEnvelopeArray(CustomerResponseDto)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async list() {
		const customers = await this.listCustomersUseCase.execute();

		return {
			data: CustomerPresenter.toResponseMany(customers),
		};
	}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Consultar cliente por ID',
		description: 'Retorna os detalhes de um cliente específico.',
	})
	@ApiParam({
		name: 'id',
		type: 'string',
		format: 'uuid',
		description: 'ID do cliente',
	})
	@ApiOkResponseEnvelope(CustomerResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiNotFoundResponse(NOT_FOUND)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async find(@Param('id', new ParseUUIDPipe()) id: string) {
		const customer = await this.findCustomerUseCase.execute(id);

		return {
			data: CustomerPresenter.toResponse(customer),
		};
	}

	@Patch(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Atualizar cliente',
		description:
			'Atualiza os dados de um cliente existente. Pode atualizar alguns ou todos os campos.',
	})
	@ApiParam({
		name: 'id',
		type: 'string',
		format: 'uuid',
		description: 'ID do cliente',
	})
	@ApiOkResponseEnvelope(CustomerResponseDto)
	@ApiBadRequestResponse({
		description:
			'Corpo inválido: falha do ValidationPipe ou nenhum campo enviado para atualização (código customer.update.no_fields).',
	})
	@ApiNotFoundResponse(NOT_FOUND)
	@ApiConflictResponse(CONFLICT)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async update(
		@Param('id', new ParseUUIDPipe()) id: string,
		@Body(UpdateCustomerValidator) body: UpdateCustomerValidated,
	) {
		const customer = await this.updateCustomerUseCase.execute(id, {
			name: body.name,
			email: body.email,
			phone: body.phone,
			cpf: body.cpf,
		});

		return {
			data: CustomerPresenter.toResponse(customer),
		};
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({
		summary: 'Deletar cliente',
		description: 'Remove um cliente da base de dados.',
	})
	@ApiParam({
		name: 'id',
		type: 'string',
		format: 'uuid',
		description: 'ID do cliente',
	})
	@ApiNoContentResponse({
		description: 'Cliente deletado com sucesso.',
	})
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiNotFoundResponse(NOT_FOUND)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async delete(@Param('id', new ParseUUIDPipe()) id: string) {
		await this.deleteCustomerUseCase.execute(id);
	}
}

export { CustomerController };
