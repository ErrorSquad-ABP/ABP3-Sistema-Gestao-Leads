import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

// biome-ignore lint/style/useImportType: classe necessária em runtime para DI (Nest)
import { RedisService } from '../../../../shared/infrastructure/redis/redis.service.js';
import { Public } from '../../../../shared/presentation/decorators/public.decorator.js';
import { ApiOkResponseEnvelope } from '../../../../shared/presentation/swagger/api-success-response.js';

class HealthResponseDto {
	@ApiProperty({ example: 'ok' })
	status!: string;

	@ApiProperty({ format: 'date-time' })
	timestamp!: string;
}

class HealthReadyResponseDto {
	@ApiProperty({ example: 'ready' })
	status!: string;

	@ApiProperty({ format: 'date-time' })
	timestamp!: string;
}

@Public()
@ApiTags('health')
@Controller('health')
class HealthController {
	constructor(private readonly redis: RedisService) {}

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

	@Get('ready')
	@ApiOperation({
		summary: 'Readiness (Redis)',
		description:
			'Verifica Redis (sessões auth / rate limit). Retorna 503 se indisponível.',
	})
	@ApiOkResponseEnvelope(HealthReadyResponseDto)
	async getReady(): Promise<HealthReadyResponseDto> {
		try {
			await this.redis.ping();
		} catch {
			throw new ServiceUnavailableException('Redis indisponível.');
		}
		return {
			status: 'ready',
			timestamp: new Date().toISOString(),
		};
	}
}

export { HealthController };
