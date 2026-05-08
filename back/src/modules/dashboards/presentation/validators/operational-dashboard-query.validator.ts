import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

class OperationalDashboardQueryValidator {
	@ApiPropertyOptional({
		description:
			'Data inicial ISO-8601 (inclusiva). Se omitida junto com endDate, aplica janela padrão de 30 dias.',
		example: '2026-03-29T00:00:00.000Z',
	})
	@IsOptional()
	@IsDateString()
	startDate?: string;

	@ApiPropertyOptional({
		description:
			'Data final ISO-8601 (exclusiva). Se omitida junto com startDate, aplica janela padrão de 30 dias.',
		example: '2026-04-28T00:00:00.000Z',
	})
	@IsOptional()
	@IsDateString()
	endDate?: string;
}

export { OperationalDashboardQueryValidator };
