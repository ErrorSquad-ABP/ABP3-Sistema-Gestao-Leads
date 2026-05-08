import { ApiProperty } from '@nestjs/swagger';

class DashboardDistributionItemDto {
	@ApiProperty({
		example: 'NEW',
		description: 'Chave canônica da dimensão (status, origem ou importância).',
	})
	key!: string;

	@ApiProperty({ example: 42, minimum: 0 })
	count!: number;

	@ApiProperty({ example: 35, minimum: 0, maximum: 100 })
	percentage!: number;
}

class DashboardStoreDistributionItemDto {
	@ApiProperty({ format: 'uuid' })
	storeId!: string;

	@ApiProperty({ example: 'Loja Centro' })
	storeName!: string;

	@ApiProperty({ example: 27, minimum: 0 })
	count!: number;

	@ApiProperty({ example: 22.5, minimum: 0, maximum: 100 })
	percentage!: number;
}

class OperationalDashboardPeriodDto {
	@ApiProperty({
		example: '2026-03-29T00:00:00.000Z',
		description: 'Início do período (inclusivo).',
	})
	startDate!: string;

	@ApiProperty({
		example: '2026-04-28T00:00:00.000Z',
		description: 'Fim do período (exclusivo).',
	})
	endDate!: string;

	@ApiProperty({ example: 30, minimum: 1 })
	days!: number;
}

class OperationalDashboardTotalsDto {
	@ApiProperty({ example: 120, minimum: 0 })
	totalLeads!: number;

	@ApiProperty({
		example: 64,
		minimum: 0,
		description: 'Leads no período com negociação aberta.',
	})
	totalLeadsWithOpenDeal!: number;
}

class OperationalDashboardDistributionsDto {
	@ApiProperty({ type: [DashboardDistributionItemDto] })
	byStatus!: DashboardDistributionItemDto[];

	@ApiProperty({ type: [DashboardDistributionItemDto] })
	bySource!: DashboardDistributionItemDto[];

	@ApiProperty({ type: [DashboardStoreDistributionItemDto] })
	byStore!: DashboardStoreDistributionItemDto[];

	@ApiProperty({ type: [DashboardDistributionItemDto] })
	byImportance!: DashboardDistributionItemDto[];
}

class OperationalDashboardScopeDto {
	@ApiProperty({
		enum: ['ADMINISTRATOR', 'MANAGER', 'GENERAL_MANAGER'],
		description: 'Papel efetivo que consultou o dashboard.',
	})
	role!: 'ADMINISTRATOR' | 'MANAGER' | 'GENERAL_MANAGER';

	@ApiProperty({
		type: [String],
		description:
			'Stores incluídas no recorte. Em ADMINISTRATOR, retorna `null` (escopo global).',
		nullable: true,
	})
	storeIds!: string[] | null;
}

class OperationalDashboardResponseDto {
	@ApiProperty({ type: OperationalDashboardPeriodDto })
	period!: OperationalDashboardPeriodDto;

	@ApiProperty({ type: OperationalDashboardScopeDto })
	scope!: OperationalDashboardScopeDto;

	@ApiProperty({ type: OperationalDashboardTotalsDto })
	totals!: OperationalDashboardTotalsDto;

	@ApiProperty({ type: OperationalDashboardDistributionsDto })
	distributions!: OperationalDashboardDistributionsDto;
}

export {
	DashboardDistributionItemDto,
	DashboardStoreDistributionItemDto,
	OperationalDashboardResponseDto,
};
