import {
	IsIn,
	IsNotEmpty,
	IsString,
	IsUUID,
	ValidateIf,
} from 'class-validator';

import { LEAD_STATUSES } from '../../../../shared/domain/enums/lead-status.enum.js';
import { ALLOWED_LEAD_SOURCES } from '../../../../shared/domain/value-objects/lead-source.value-object.js';

class UpdateLeadValidator {
	@IsUUID()
	customerId!: string;

	@IsUUID()
	storeId!: string;

	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsUUID()
	ownerUserId!: string | null;

	@IsString()
	@IsNotEmpty()
	@IsIn(ALLOWED_LEAD_SOURCES)
	source!: string;

	@IsString()
	@IsNotEmpty()
	@IsIn(LEAD_STATUSES)
	status!: string;
}

export { UpdateLeadValidator };
