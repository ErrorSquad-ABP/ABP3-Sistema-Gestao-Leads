import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsIn,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	Min,
	ValidateIf,
} from 'class-validator';

import { SUPPORTED_FUEL_TYPES } from '../../../../shared/domain/enums/supported-fuel-type.enum.js';
import { VEHICLE_STATUSES } from '../../../../shared/domain/enums/vehicle-status.enum.js';

class CreateVehicleValidator {
	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	storeId!: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	brand!: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	model!: string;

	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsString()
	@IsNotEmpty()
	version?: string | null;

	@ApiProperty()
	@IsInt()
	modelYear!: number;

	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsInt()
	manufactureYear?: number | null;

	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsString()
	@IsNotEmpty()
	color?: string | null;

	@ApiProperty({ description: 'Quilometragem (obrigatório)' })
	@IsInt()
	@Min(0)
	mileage!: number;

	@ApiProperty({ enum: SUPPORTED_FUEL_TYPES })
	@IsString()
	@IsIn(SUPPORTED_FUEL_TYPES)
	supportedFuelType!: string;

	@ApiProperty({ description: 'Preço como string decimal (ex.: "45000.00")' })
	@IsString()
	@IsNotEmpty()
	price!: string;

	@ApiPropertyOptional({ enum: VEHICLE_STATUSES, default: 'AVAILABLE' })
	@IsOptional()
	@IsString()
	@IsIn(VEHICLE_STATUSES)
	status?: string;

	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsString()
	@IsNotEmpty()
	plate?: string | null;

	@ApiPropertyOptional({ nullable: true, description: 'VIN / chassi' })
	@IsOptional()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsString()
	@IsNotEmpty()
	vin?: string | null;
}

export { CreateVehicleValidator };
