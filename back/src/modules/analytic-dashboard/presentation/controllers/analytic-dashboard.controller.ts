import { Controller, Get, Query } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import { ApiOkResponseEnvelope } from '../../../../shared/presentation/swagger/api-success-response.js';
import {
	CurrentUser,
	type JwtUser,
} from '../../../auth/presentation/decorators/current-user.decorator.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import { AnalyticDashboardResponseDto } from '../../application/dto/analytic-dashboard-response.dto.js';
import { GetAnalyticDashboardUseCase } from '../../application/use-cases/get-analytic-dashboard.use-case.js';
import { AnalyticDashboardPresenter } from '../presenters/analytic-dashboard.presenter.js';
import { AnalyticDashboardQueryValidator } from '../validators/analytic-dashboard-query.validator.js';

const BAD_REQUEST = {
	description:
		'Parametros invalidos ou intervalo temporal rejeitado pela regra de negocio.',
};

const UNAUTHORIZED = {
	description: 'Token Bearer ausente ou invalido.',
};

const FORBIDDEN = {
	description: 'Utilizador autenticado sem permissao para o recurso solicitado.',
};

const SERVER_ERROR = {
	description: 'Erro interno inesperado.',
};

function toLeadActor(user: JwtUser): LeadActor {
	return {
		userId: user.userId,
		role: user.role as UserRole,
	};
}

@ApiBearerAuth('access-token')
@ApiTags('dashboards')
@ApiUnauthorizedResponse(UNAUTHORIZED)
@Controller('dashboards')
class AnalyticDashboardController {
	constructor(
		private readonly getAnalyticDashboardUseCase: GetAnalyticDashboardUseCase,
	) {}

	@Get('analytic')
	@ApiOperation({
		summary: 'Consultar dashboard analitico',
		description:
			'Retorna metricas analiticas reais do funil comercial com escopo automatico por papel e filtro temporal validado no backend.',
	})
	@ApiOkResponseEnvelope(AnalyticDashboardResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async getDashboard(
		@CurrentUser() user: JwtUser,
		@Query() query: AnalyticDashboardQueryValidator,
	) {
		const dashboard = await this.getAnalyticDashboardUseCase.execute(
			toLeadActor(user),
			{
				mode: query.mode,
				referenceDate: query.referenceDate,
				startDate: query.startDate,
				endDate: query.endDate,
			},
		);

		return AnalyticDashboardPresenter.toResponse(
			dashboard as AnalyticDashboardResponseDto,
		);
	}
}

export { AnalyticDashboardController };
