import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

import { ApiOkResponseEnvelope } from '../../../../shared/presentation/swagger/api-success-response.js';

class HealthResponseDto {
	@ApiProperty({ example: 'ok' })
	status!: string;

	@ApiProperty({ format: 'date-time' })
	timestamp!: string;
}

@ApiTags('health')
@Controller('health')
class HealthController {
	@Get()
	@ApiOperation({
		summary: 'Health check',
		description:
			'Indica se o processo HTTP está ativo. Não valida conexão com banco ou serviços externos.',
	})
	@ApiOkResponseEnvelope(HealthResponseDto, {
		description:
			'Serviço disponível (corpo real: envelope global; `data` contém o payload).',
	})
	getHealth(): HealthResponseDto {
		return {
			status: 'ok',
			timestamp: new Date().toISOString(),
		};
	}
}

export { HealthController };
