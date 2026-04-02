import { IsUUID, ValidateIf } from 'class-validator';

class ReassignLeadValidator {
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsUUID()
	ownerUserId!: string | null;
}

export { ReassignLeadValidator };
