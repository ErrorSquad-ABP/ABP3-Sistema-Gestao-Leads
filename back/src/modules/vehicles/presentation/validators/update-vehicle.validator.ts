import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsIn,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	Min,
	ValidateIf,
} from 'class-validator';

import { SUPPORTED_FUEL_TYPES } from '../../../../shared/domain/enums/supported-fuel-type.enum.js';
import { VEHICLE_STATUSES } from '../../../../shared/domain/enums/vehicle-status.enum.js';

class UpdateVehicleValidator {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	brand?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	model?: string;

	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsString()
	@IsNotEmpty()
	version?: string | null;

	@ApiPropertyOptional()
	@IsOptional()
	@IsInt()
	modelYear?: number;

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

	@ApiPropertyOptional()
	@IsOptional()
	@IsInt()
	@Min(0)
	mileage?: number;

	@ApiPropertyOptional({ enum: SUPPORTED_FUEL_TYPES })
	@IsOptional()
	@IsString()
	@IsIn(SUPPORTED_FUEL_TYPES)
	supportedFuelType?: string;

	@ApiPropertyOptional({
		description: 'Preço como string decimal (ex.: "45000.00")',
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	price?: string;

	@ApiPropertyOptional({ enum: VEHICLE_STATUSES })
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

export { UpdateVehicleValidator };
