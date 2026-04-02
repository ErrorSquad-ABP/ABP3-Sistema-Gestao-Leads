type CreateLeadDto = {
	readonly customerId: string;
	readonly storeId: string;
	readonly ownerUserId: string | null;
	readonly source: string;
};

export type { CreateLeadDto };
