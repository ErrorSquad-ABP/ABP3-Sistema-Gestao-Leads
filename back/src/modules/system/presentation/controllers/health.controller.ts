import { Controller, Get } from '@nestjs/common';
import {
	ApiOkResponse,
	ApiOperation,
	ApiProperty,
	ApiTags,
} from '@nestjs/swagger';

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
	@ApiOkResponse({ description: 'Serviço disponível', type: HealthResponseDto })
	getHealth(): HealthResponseDto {
		return {
			status: 'ok',
			timestamp: new Date().toISOString(),
		};
	}
}

export { HealthController };
