import { ApiProperty } from '@nestjs/swagger';

import { DEAL_STAGES } from '../../../../shared/domain/enums/deal-stage.enum.js';
import { DealResponseDto } from './deal-response.dto.js';

class DealPipelineStageDto {
	@ApiProperty({ enum: DEAL_STAGES })
	key!: string;

	@ApiProperty()
	label!: string;

	@ApiProperty({ description: 'Quantidade total de negociações na etapa.' })
	count!: number;

	@ApiProperty({
		nullable: true,
		description: 'Soma total da etapa como decimal em string.',
	})
	totalValue!: string | null;

	@ApiProperty()
	page!: number;

	@ApiProperty()
	pageSize!: number;

	@ApiProperty()
	totalPages!: number;

	@ApiProperty()
	hasNextPage!: boolean;

	@ApiProperty({ type: [DealResponseDto] })
	items!: DealResponseDto[];
}

class DealPipelineResponseDto {
	@ApiProperty({ type: [DealPipelineStageDto] })
	stages!: DealPipelineStageDto[];
}

export { DealPipelineResponseDto, DealPipelineStageDto };
