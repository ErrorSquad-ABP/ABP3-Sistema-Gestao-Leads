type CreateTeamDto = {
	readonly name: string;
	readonly managerId: string | null;
	readonly storeId: string | null;
};

export type { CreateTeamDto };
