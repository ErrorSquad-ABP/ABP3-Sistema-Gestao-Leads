export const UserRole = {
	ATTENDANT: 'ATTENDANT',
	MANAGER: 'MANAGER',
	GENERAL_MANAGER: 'GENERAL_MANAGER',
	ADMIN: 'ADMIN',
} as const;
export type UserRoleValue = (typeof UserRole)[keyof typeof UserRole];

export const LeadSource = {
	WEBSITE: 'WEBSITE',
	WHATSAPP: 'WHATSAPP',
	PHONE: 'PHONE',
	WALK_IN: 'WALK_IN',
	INDICATION: 'INDICATION',
	OTHER: 'OTHER',
	INSTAGRAM: 'INSTAGRAM',
} as const;
export type LeadSourceValue = (typeof LeadSource)[keyof typeof LeadSource];

export const LeadStatus = {
	NEW: 'NEW',
	CONTACTED: 'CONTACTED',
	QUALIFIED: 'QUALIFIED',
	NEGOTIATING: 'NEGOTIATING',
	CONVERTED: 'CONVERTED',
	LOST: 'LOST',
} as const;
export type LeadStatusValue = (typeof LeadStatus)[keyof typeof LeadStatus];
