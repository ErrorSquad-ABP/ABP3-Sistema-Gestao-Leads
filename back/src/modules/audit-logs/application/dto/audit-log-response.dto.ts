import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AuditLogActorResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty({ format: 'email' })
	email!: string;
}

class AuditLogResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiPropertyOptional({ format: 'uuid', nullable: true })
	actorUserId!: string | null;

	@ApiPropertyOptional({ type: AuditLogActorResponseDto, nullable: true })
	actor!: AuditLogActorResponseDto | null;

	@ApiProperty({
		enum: [
			'LOGIN',
			'CREATE',
			'UPDATE',
			'DELETE',
			'STATUS_CHANGE',
			'STAGE_CHANGE',
		],
	})
	action!: string;

	@ApiProperty({
		description: 'Nome interno da entidade auditada, ex.: Vehicle, Deal.',
	})
	entityName!: string;

	@ApiPropertyOptional({ nullable: true })
	entityId!: string | null;

	@ApiPropertyOptional({
		nullable: true,
		type: 'object',
		additionalProperties: true,
	})
	metadata!: unknown;

	@ApiProperty({ format: 'date-time' })
	createdAt!: string;
}

export { AuditLogActorResponseDto, AuditLogResponseDto };
