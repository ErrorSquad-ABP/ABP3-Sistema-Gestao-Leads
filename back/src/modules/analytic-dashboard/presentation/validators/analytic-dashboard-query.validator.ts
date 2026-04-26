import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, Matches } from 'class-validator';

const ANALYTIC_TIME_MODES = ['week', 'month', 'year', 'custom'] as const;

class AnalyticDashboardQueryValidator {
	@ApiPropertyOptional({
		enum: ANALYTIC_TIME_MODES,
		default: 'month',
	})
	@IsOptional()
	@IsIn(ANALYTIC_TIME_MODES)
	mode: (typeof ANALYTIC_TIME_MODES)[number] = 'month';

	@ApiPropertyOptional({
		description:
			'Data de referencia para week, month e year no formato YYYY-MM-DD.',
		example: '2026-04-25',
	})
	@IsOptional()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	referenceDate?: string;

	@ApiPropertyOptional({
		description: 'Inicio do periodo customizado no formato YYYY-MM-DD.',
		example: '2026-04-01',
	})
	@IsOptional()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	startDate?: string;

	@ApiPropertyOptional({
		description: 'Fim do periodo customizado no formato YYYY-MM-DD.',
		example: '2026-04-30',
	})
	@IsOptional()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	endDate?: string;
}

export { ANALYTIC_TIME_MODES, AnalyticDashboardQueryValidator };
