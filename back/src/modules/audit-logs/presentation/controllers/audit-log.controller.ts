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

import { Roles } from '../../../../shared/presentation/decorators/roles.decorator.js';
import { ApiOkResponseEnvelopePaged } from '../../../../shared/presentation/swagger/api-success-response.js';
import { AuditLogResponseDto } from '../../application/dto/audit-log-response.dto.js';
// biome-ignore lint/style/useImportType: Nest DI
import { ListAuditLogsUseCase } from '../../application/use-cases/list-audit-logs.use-case.js';
import { AuditLogPresenter } from '../presenters/audit-log.presenter.js';
import { ListAuditLogsQueryValidator } from '../validators/list-audit-logs-query.validator.js';

const BAD_REQUEST = {
	description:
		'Query invalida: paginacao fora do intervalo ou filtro de categoria/acao desconhecido.',
};

const SERVER_ERROR = {
	description: 'Erro interno ao consultar logs de auditoria.',
};

const UNAUTHORIZED = {
	description: 'Token Bearer ausente ou invalido.',
};

const FORBIDDEN = {
	description: 'Papel insuficiente: auditoria exige ADMINISTRATOR.',
};

@ApiBearerAuth('access-token')
@ApiTags('audit-logs')
@ApiUnauthorizedResponse(UNAUTHORIZED)
@ApiForbiddenResponse(FORBIDDEN)
@Roles('ADMINISTRATOR')
@Controller('audit-logs')
class AuditLogController {
	constructor(private readonly listAuditLogsUseCase: ListAuditLogsUseCase) {}

	@Get()
	@ApiOperation({
		summary: 'Listar logs de auditoria',
		description:
			'Consulta administrativa paginada da trilha de auditoria. Sem filtros, retorna todos os logs. Permite filtrar por categoria/dominio, acao/tipo, usuario e periodo.',
	})
	@ApiOkResponseEnvelopePaged(AuditLogResponseDto, {
		description:
			'Pagina de logs: `data.items`, `data.page`, `data.limit`, `data.total`, `data.totalPages`.',
	})
	@ApiBadRequestResponse(BAD_REQUEST)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async list(@Query() query: ListAuditLogsQueryValidator) {
		const result = await this.listAuditLogsUseCase.execute({
			page: query.page,
			limit: query.limit,
			category: query.category,
			action: query.action ?? query.type,
			user: query.user,
			startDate: query.startDate ? new Date(query.startDate) : undefined,
			endDate: query.endDate ? new Date(query.endDate) : undefined,
		});
		return {
			items: AuditLogPresenter.toResponseList(result.items),
			page: result.page,
			limit: result.limit,
			total: result.total,
			totalPages: result.totalPages,
		};
	}
}

export { AuditLogController };
