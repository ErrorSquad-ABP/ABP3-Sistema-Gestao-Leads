import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

// biome-ignore lint/style/useImportType: Nest depende da classe em runtime para metadata de DI.
import { GetSystemSummaryUseCase } from '../../application/use-cases/get-system-summary.use-case.js';

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
	@ApiResponse({ status: 200, description: 'Resumo retornado com sucesso' })
	getSummary() {
		return this.getSystemSummaryUseCase.execute();
	}
}

export { SystemController };
