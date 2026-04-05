import { Controller, Get } from '@nestjs/common';
import {
	ApiInternalServerErrorResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';

import { ApiOkResponseEnvelopeArray } from '../../../../shared/presentation/swagger/api-success-response.js';
import { StoreResponseDto } from '../../application/dto/store-response.dto.js';
import type { ListStoresUseCase } from '../../application/use-cases/list-stores.use-case.js';
import { StorePresenter } from '../presenters/store.presenter.js';

const SERVER_ERROR = {
	description:
		'Erro interno ou erro de domínio ainda não mapeado para status HTTP específico.',
};

@ApiTags('stores')
@Controller('stores')
class StoreController {
	constructor(private readonly listStoresUseCase: ListStoresUseCase) {}

	@Get()
	@ApiOperation({
		summary: 'Listar lojas',
		description:
			'Retorna lojas para composição de vínculos e seleção em formulários da Sprint 1.',
	})
	@ApiOkResponseEnvelopeArray(StoreResponseDto)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async list() {
		const stores = await this.listStoresUseCase.execute();
		return StorePresenter.toResponseList(stores);
	}
}

export { StoreController };
