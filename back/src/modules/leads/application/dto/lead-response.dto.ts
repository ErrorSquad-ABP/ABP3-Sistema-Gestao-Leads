type LeadResponseDto = {
	readonly id: string;
	readonly customerId: string;
	readonly storeId: string;
	readonly ownerUserId: string | null;
	readonly source: string;
	readonly status: string;
};

export type { LeadResponseDto };
