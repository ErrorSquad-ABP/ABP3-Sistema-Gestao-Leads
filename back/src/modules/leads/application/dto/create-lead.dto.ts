type CreateLeadDto = {
	readonly customerId: string;
	readonly storeId: string;
	readonly ownerUserId: string | null;
	readonly source: string;
	readonly vehicleInterestText?: string | null;
};

export type { CreateLeadDto };
