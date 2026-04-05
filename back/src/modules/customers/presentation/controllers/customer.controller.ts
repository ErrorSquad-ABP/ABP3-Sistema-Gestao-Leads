import { Controller, Get } from '@nestjs/common';
import {
	ApiInternalServerErrorResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';

import { ApiOkResponseEnvelopeArray } from '../../../../shared/presentation/swagger/api-success-response.js';
import { CustomerResponseDto } from '../../application/dto/customer-response.dto.js';
import type { ListCustomersUseCase } from '../../application/use-cases/list-customers.use-case.js';
import { CustomerPresenter } from '../presenters/customer.presenter.js';

const SERVER_ERROR = {
	description:
		'Erro interno ou erro de domínio ainda não mapeado para status HTTP específico.',
};

@ApiTags('customers')
@Controller('customers')
class CustomerController {
	constructor(private readonly listCustomersUseCase: ListCustomersUseCase) {}

	@Get()
	@ApiOperation({
		summary: 'Listar clientes',
		description:
			'Retorna clientes para composição de vínculos e seleção em formulários da Sprint 1.',
	})
	@ApiOkResponseEnvelopeArray(CustomerResponseDto)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async list() {
		const customers = await this.listCustomersUseCase.execute();
		return CustomerPresenter.toResponseList(customers);
	}
}

export { CustomerController };
