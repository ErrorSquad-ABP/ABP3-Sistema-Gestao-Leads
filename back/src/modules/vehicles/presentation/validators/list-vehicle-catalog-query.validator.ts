import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
} from 'class-validator';

import { VEHICLE_STATUSES } from '../../../../shared/domain/enums/vehicle-status.enum.js';

const VEHICLE_CATALOG_SORTS = [
	'recent',
	'price_asc',
	'price_desc',
	'mileage_asc',
	'mileage_desc',
	'interest_desc',
] as const;

class ListVehicleCatalogQueryValidator {
	@ApiPropertyOptional({ format: 'uuid', description: 'Filtro por loja' })
	@IsOptional()
	@IsUUID()
	storeId?: string;

	@ApiPropertyOptional({ enum: VEHICLE_STATUSES })
	@IsOptional()
	@IsString()
	@IsIn(VEHICLE_STATUSES)
	status?: string;

	@ApiPropertyOptional({
		description: 'Busca por marca, modelo, versão, placa ou VIN.',
	})
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({ enum: VEHICLE_CATALOG_SORTS })
	@IsOptional()
	@IsString()
	@IsIn(VEHICLE_CATALOG_SORTS)
	sort?: (typeof VEHICLE_CATALOG_SORTS)[number];

	@ApiPropertyOptional({ default: 1, minimum: 1 })
	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt()
	@Min(1)
	page?: number;

	@ApiPropertyOptional({ default: 8, minimum: 1, maximum: 50 })
	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt()
	@Min(1)
	@Max(50)
	limit?: number;
}

export { ListVehicleCatalogQueryValidator, VEHICLE_CATALOG_SORTS };
