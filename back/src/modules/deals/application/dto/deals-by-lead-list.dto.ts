import { ApiProperty } from '@nestjs/swagger';

import { DealResponseDto } from './deal-response.dto.js';

class DealsByLeadListDto {
	@ApiProperty({ type: [DealResponseDto] })
	items!: DealResponseDto[];

	@ApiProperty({
		description:
			'Indica se o utilizador pode criar ou mutar negociações deste lead (incluindo listagem vazia).',
	})
	canMutateLead!: boolean;
}

export { DealsByLeadListDto };
