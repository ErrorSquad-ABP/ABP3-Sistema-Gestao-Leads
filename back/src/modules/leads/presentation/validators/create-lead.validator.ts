import {
	IsIn,
	IsNotEmpty,
	IsString,
	IsUUID,
	ValidateIf,
} from 'class-validator';

import { ALLOWED_LEAD_SOURCES } from '../../../../shared/domain/value-objects/lead-source.value-object.js';

class CreateLeadValidator {
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
}

export { CreateLeadValidator };
