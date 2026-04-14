type TeamRecord = {
	readonly id: string;
	readonly name: string;
	readonly storeId: string;
	readonly managerId: string | null;
	readonly memberUserIds: readonly string[];
};

export type { TeamRecord };
