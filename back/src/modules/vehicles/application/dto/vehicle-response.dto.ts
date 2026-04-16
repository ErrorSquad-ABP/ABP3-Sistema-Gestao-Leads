import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { SUPPORTED_FUEL_TYPES } from '../../../../shared/domain/enums/supported-fuel-type.enum.js';
import { VEHICLE_STATUSES } from '../../../../shared/domain/enums/vehicle-status.enum.js';

class VehicleResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ format: 'uuid' })
	storeId!: string;

	@ApiProperty()
	brand!: string;

	@ApiProperty()
	model!: string;

	@ApiPropertyOptional({ nullable: true })
	version!: string | null;

	@ApiProperty()
	modelYear!: number;

	@ApiPropertyOptional({ nullable: true })
	manufactureYear!: number | null;

	@ApiPropertyOptional({ nullable: true })
	color!: string | null;

	@ApiProperty()
	mileage!: number;

	@ApiProperty({ enum: SUPPORTED_FUEL_TYPES })
	supportedFuelType!: string;

	@ApiProperty({
		description: 'Preço como decimal em string (BRL).',
		example: '45000.00',
	})
	price!: string;

	@ApiProperty({ enum: VEHICLE_STATUSES })
	status!: string;

	@ApiPropertyOptional({ nullable: true })
	plate!: string | null;

	@ApiPropertyOptional({ nullable: true })
	vin!: string | null;

	@ApiProperty({ type: String, format: 'date-time' })
	createdAt!: Date;

	@ApiProperty({ type: String, format: 'date-time' })
	updatedAt!: Date;
}

export { VehicleResponseDto };
