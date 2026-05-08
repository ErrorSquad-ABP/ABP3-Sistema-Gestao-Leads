import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Matches, Max, Min } from 'class-validator';

const ANALYTIC_TIME_MODES = ['week', 'month', 'year', 'custom'] as const;
const ANALYTIC_DASHBOARD_MAX_TOP = 20;

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

	@ApiPropertyOptional({
		description:
			'Limite maximo de itens retornados nos rankings por atendente e por equipe.',
		example: 6,
		minimum: 1,
		maximum: ANALYTIC_DASHBOARD_MAX_TOP,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(ANALYTIC_DASHBOARD_MAX_TOP)
	top?: number;
}

export {
	ANALYTIC_DASHBOARD_MAX_TOP,
	ANALYTIC_TIME_MODES,
	AnalyticDashboardQueryValidator,
};
