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
	ApiBearerAuth,
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
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { CreateCustomerUseCase } from '../../application/use-cases/create-customer.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { DeleteCustomerUseCase } from '../../application/use-cases/delete-customer.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { FindCustomerUseCase } from '../../application/use-cases/find-customer.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { ListCustomersUseCase } from '../../application/use-cases/list-customers.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { UpdateCustomerUseCase } from '../../application/use-cases/update-customer.use-case.js';
import { CustomerPresenter } from '../presenters/customer.presenter.js';
// biome-ignore lint/style/useImportType: validators usados em runtime
import { CreateCustomerValidator } from '../validators/create-customer.validator.js';
// biome-ignore lint/style/useImportType: validators usados em runtime
import { UpdateCustomerValidator } from '../validators/update-customer.validator.js';

const BAD_REQUEST = {
	description:
		'Corpo ou parâmetros inválidos (falha de validação do ValidationPipe).',
};

const SERVER_ERROR = {
	description:
		'Erro interno ou erro de domínio ainda não mapeado para status HTTP específico.',
};

const CUSTOMER_NOT_FOUND = {
	description:
		'Cliente não encontrado (`customer.not_found`). Envelope JSON de erro.',
};

const CUSTOMER_CONFLICT = {
	description:
		'Violação de unicidade: e-mail ou CPF já usado por outro cliente (`customer.email_already_exists`, `customer.cpf_already_exists`). Envelope JSON de erro.',
};

@ApiBearerAuth()
@ApiTags('customers')
@Controller('customers')
class CustomerController {
	constructor(
		private readonly createCustomerUseCase: CreateCustomerUseCase,
		private readonly listCustomersUseCase: ListCustomersUseCase,
		private readonly findCustomerUseCase: FindCustomerUseCase,
		private readonly updateCustomerUseCase: UpdateCustomerUseCase,
		private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
	) {}

	@Post()
	@ApiOperation({
		summary: 'Criar cliente',
		description:
			'CRUD de clientes (US-06). Cria um novo cliente com os dados fornecidos.',
	})
	@ApiCreatedResponseEnvelope(CustomerResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiConflictResponse(CUSTOMER_CONFLICT)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async create(@Body() body: CreateCustomerValidator) {
		const customer = await this.createCustomerUseCase.execute({
			name: body.name,
			email: body.email,
			phone: body.phone,
			cpf: body.cpf,
		});
		return CustomerPresenter.toResponse(customer);
	}

	@Get()
	@ApiOperation({
		summary: 'Listar clientes',
		description:
			'Lista todos os clientes cadastrados (US-06). Consulta inicial de clientes.',
	})
	@ApiOkResponseEnvelopeArray(CustomerResponseDto)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async list() {
		const customers = await this.listCustomersUseCase.execute();
		return CustomerPresenter.toResponseList(customers);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Buscar cliente por id' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(CustomerResponseDto)
	@ApiBadRequestResponse({
		description: 'UUID inválido no parâmetro de rota.',
	})
	@ApiNotFoundResponse(CUSTOMER_NOT_FOUND)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async findById(@Param('id', ParseUUIDPipe) id: string) {
		const customer = await this.findCustomerUseCase.execute(id);
		return CustomerPresenter.toResponse(customer);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Atualizar cliente' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(CustomerResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiNotFoundResponse(CUSTOMER_NOT_FOUND)
	@ApiConflictResponse(CUSTOMER_CONFLICT)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateCustomerValidator,
	) {
		const customer = await this.updateCustomerUseCase.execute(id, body);
		return CustomerPresenter.toResponse(customer);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Excluir cliente' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiNoContentResponse({
		description:
			'Cliente removido (sem corpo JSON; envelope aplicado apenas em respostas com corpo).',
	})
	@ApiBadRequestResponse({
		description: 'UUID inválido no parâmetro de rota.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.deleteCustomerUseCase.execute(id);
	}
}

export { CustomerController };
