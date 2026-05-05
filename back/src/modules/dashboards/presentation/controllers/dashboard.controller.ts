import { Controller, Get, Inject, Query } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';

import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import { ApiOkResponseEnvelope } from '../../../../shared/presentation/swagger/api-success-response.js';
import {
	CurrentUser,
	type JwtUser,
} from '../../../auth/presentation/decorators/current-user.decorator.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import { OperationalDashboardResponseDto } from '../../application/dto/operational-dashboard-response.dto.js';
import { GetOperationalDashboardUseCase } from '../../application/use-cases/get-operational-dashboard.use-case.js';
// biome-ignore lint/style/useImportType: necessario em runtime para metadata de validacao do Nest
import { OperationalDashboardQueryValidator } from '../validators/operational-dashboard-query.validator.js';

const BAD_REQUEST = {
	description:
		'Parâmetros inválidos (ex.: startDate sem endDate, ou intervalo inválido).',
};

const FORBIDDEN = {
	description:
		'Utilizador autenticado sem permissão para dashboard operacional no escopo solicitado.',
};

const SERVER_ERROR = {
	description: 'Erro interno do servidor.',
};

function toLeadActor(user: JwtUser): LeadActor {
	return {
		userId: user.userId,
		role: user.role as UserRole,
	};
}

@ApiBearerAuth()
@ApiTags('dashboards')
@Controller('dashboards')
class DashboardController {
	constructor(
		@Inject(GetOperationalDashboardUseCase)
		private readonly getOperationalDashboardUseCase: GetOperationalDashboardUseCase,
	) {}

	@Get('operational')
	@ApiOperation({
		summary: 'Dashboard operacional (RF04)',
		description:
			'Retorna total de leads e distribuições por status, origem, loja e importância. Aplica filtro padrão de 30 dias quando não informado período.',
	})
	@ApiOkResponseEnvelope(OperationalDashboardResponseDto)
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiForbiddenResponse(FORBIDDEN)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	getOperational(
		@CurrentUser() user: JwtUser,
		@Query() query: OperationalDashboardQueryValidator,
	) {
		return this.getOperationalDashboardUseCase.execute(toLeadActor(user), {
			startDate: query.startDate,
			endDate: query.endDate,
		});
	}
}

export { DashboardController };
