import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';

type LeadActor = {
	readonly userId: string;
	readonly role: UserRole;
};

export type { LeadActor };
