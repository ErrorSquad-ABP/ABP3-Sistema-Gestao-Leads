import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class DealHistoryItemDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ format: 'uuid' })
	dealId!: string;

	@ApiProperty({ example: 'STAGE' })
	field!: string;

	@ApiPropertyOptional({ nullable: true })
	fromValue!: string | null;

	@ApiProperty()
	toValue!: string;

	@ApiPropertyOptional({ format: 'uuid', nullable: true })
	actorUserId!: string | null;

	@ApiProperty({ type: String, format: 'date-time' })
	createdAt!: Date;
}

export { DealHistoryItemDto };
