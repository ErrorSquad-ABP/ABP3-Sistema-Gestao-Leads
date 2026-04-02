import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// biome-ignore lint/style/useImportType: Nest depende da classe em runtime para metadata de DI.
import { GetSystemSummaryUseCase } from '../../application/use-cases/get-system-summary.use-case.js';
import { ApiOkResponseEnvelope } from '../../../../shared/presentation/swagger/api-success-response.js';
import { SystemSummaryResponseDto } from '../dto/system-summary.response.dto.js';

@ApiTags('system')
@Controller('v1')
class SystemController {
	constructor(
		private readonly getSystemSummaryUseCase: GetSystemSummaryUseCase,
	) {}

	@Get()
	@ApiOperation({
		summary: 'Resumo da API',
		description:
			'Retorna o estado inicial da API, módulos planejados e metadados arquiteturais.',
	})
	@ApiOkResponseEnvelope(SystemSummaryResponseDto, {
		description:
			'Resumo retornado com sucesso (corpo real: envelope global; `data` contém o payload).',
	})
	getSummary() {
		return this.getSystemSummaryUseCase.execute();
	}
}

export { SystemController };
