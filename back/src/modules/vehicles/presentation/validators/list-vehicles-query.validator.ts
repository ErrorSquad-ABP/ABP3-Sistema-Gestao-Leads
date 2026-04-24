import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

import { VEHICLE_STATUSES } from '../../../../shared/domain/enums/vehicle-status.enum.js';

class ListVehiclesQueryValidator {
	@ApiPropertyOptional({ format: 'uuid', description: 'Filtro por loja' })
	@IsOptional()
	@IsUUID()
	storeId?: string;

	@ApiPropertyOptional({ enum: VEHICLE_STATUSES })
	@IsOptional()
	@IsString()
	@IsIn(VEHICLE_STATUSES)
	status?: string;
}

export { ListVehiclesQueryValidator };
