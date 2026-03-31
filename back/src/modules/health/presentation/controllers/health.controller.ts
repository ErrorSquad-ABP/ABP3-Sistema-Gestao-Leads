import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

// biome-ignore lint/style/useImportType: Nest depende da classe em runtime para metadata de DI.
import { GetHealthUseCase } from '../../application/use-cases/get-health.use-case.js';

@ApiTags('health')
@Controller('health')
class HealthController {
	constructor(private readonly getHealthUseCase: GetHealthUseCase) {}

	@Get()
	@ApiOperation({
		summary: 'Health check da API',
		description:
			'Retorna o estado operacional básico do backend e da conexão Prisma.',
	})
	@ApiResponse({ status: 200, description: 'API saudável' })
	async getHealth() {
		return this.getHealthUseCase.execute();
	}
}

export { HealthController };
