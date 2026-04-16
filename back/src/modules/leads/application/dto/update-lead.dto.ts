type UpdateLeadDto = {
	readonly customerId: string;
	readonly storeId: string;
	readonly ownerUserId: string | null;
	readonly source: string;
	readonly status: string;
	readonly vehicleInterestText?: string | null;
};

export type { UpdateLeadDto };
