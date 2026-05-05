import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DEAL_IMPORTANCES } from '../../../../shared/domain/enums/deal-importance.enum.js';
import { DEAL_STAGES } from '../../../../shared/domain/enums/deal-stage.enum.js';
import { DEAL_STATUSES } from '../../../../shared/domain/enums/deal-status.enum.js';

class DealResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ format: 'uuid' })
	leadId!: string;

	@ApiProperty({
		description: 'Nome do cliente associado ao lead.',
		example: 'João Silva',
	})
	leadCustomerName!: string;

	@ApiPropertyOptional({
		nullable: true,
		description:
			'Nome do utilizador responsável pelo lead (owner). Ausente quando não há responsável atribuído.',
		example: 'Maria Souza',
	})
	leadOwnerName!: string | null;

	@ApiProperty({ format: 'uuid' })
	vehicleId!: string;

	@ApiProperty({
		description:
			'Resumo humano do veículo no formato "Marca Modelo Ano · Placa".',
		example: 'Toyota Corolla 2020 · ABC1D23',
	})
	vehicleLabel!: string;

	@ApiProperty()
	title!: string;

	@ApiPropertyOptional({
		nullable: true,
		description: 'Valor monetário como decimal em string.',
	})
	value!: string | null;

	@ApiProperty({ enum: DEAL_IMPORTANCES })
	importance!: string;

	@ApiProperty({ enum: DEAL_STAGES })
	stage!: string;

	@ApiProperty({ enum: DEAL_STATUSES })
	status!: string;

	@ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
	closedAt!: Date | null;

	@ApiProperty({ type: String, format: 'date-time' })
	createdAt!: Date;

	@ApiProperty({ type: String, format: 'date-time' })
	updatedAt!: Date;

	@ApiProperty({
		description:
			'Indica se o utilizador autenticado pode mutar a negociação (o mesmo critério de `assertCanMutateLead` no lead).',
	})
	canMutate!: boolean;
}

export { DealResponseDto };
