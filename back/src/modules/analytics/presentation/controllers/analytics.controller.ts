import { Controller, Get, Query } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiInternalServerErrorResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';

import { ApiOkResponseEnvelope } from '../../../../shared/presentation/swagger/api-success-response.js';
// biome-ignore lint/style/useImportType: validator usado em runtime
import { TemporalFilterQueryValidator } from '../../../../shared/presentation/validators/temporal-filter-query.validator.js';
import {
	CurrentUser,
	type JwtUser,
} from '../../../auth/presentation/decorators/current-user.decorator.js';
// biome-ignore lint/style/useImportType: Nest DI
import { GetAnalyticsDashboardUseCase } from '../../application/use-cases/get-analytics-dashboard.use-case.js';
import { AnalyticsDashboardResponseDto } from '../dto/analytics-dashboard.response.dto.js';
import { AnalyticsDashboardPresenter } from '../presenters/analytics-dashboard.presenter.js';

const BAD_REQUEST = {
	description:
		'Query string invalida ou intervalo temporal rejeitado pelas validacoes do backend.',
};

const SERVER_ERROR = {
	description:
		'Erro interno ou erro de dominio ainda nao mapeado para status HTTP especifico.',
};

@ApiBearerAuth()
@ApiTags('analytics')
@Controller('analytics')
class AnalyticsController {
	constructor(
		private readonly getAnalyticsDashboardUseCase: GetAnalyticsDashboardUseCase,
	) {}

	@Get('dashboard')
	@ApiOperation({
		summary: 'Consultar dashboard analitico',
		description:
			'Retorna indicadores analiticos reais com filtro temporal e escopo hierarquico aplicado no backend.',
	})
	@ApiOkResponseEnvelope(AnalyticsDashboardResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async getDashboard(
		@Query() query: TemporalFilterQueryValidator,
		@CurrentUser() currentUser: JwtUser,
	) {
		const dashboard = await this.getAnalyticsDashboardUseCase.execute({
			filter: query.toDto(),
			role: currentUser.role as
				| 'ATTENDANT'
				| 'MANAGER'
				| 'GENERAL_MANAGER'
				| 'ADMINISTRATOR',
			userId: currentUser.userId,
		});

		return AnalyticsDashboardPresenter.toResponse(dashboard);
	}
}

export { AnalyticsController };
