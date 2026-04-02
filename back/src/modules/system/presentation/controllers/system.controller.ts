import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

// biome-ignore lint/style/useImportType: Nest depende da classe em runtime para metadata de DI.
import { GetSystemSummaryUseCase } from '../../application/use-cases/get-system-summary.use-case.js';
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
	@ApiOkResponse({
		description: 'Resumo retornado com sucesso',
		type: SystemSummaryResponseDto,
	})
	getSummary() {
		return this.getSystemSummaryUseCase.execute();
	}
}

export { SystemController };
