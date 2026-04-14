type CreateTeamDto = {
	readonly name: string;
	readonly storeId: string;
	readonly managerId: string | null;
	readonly initialMemberUserIds?: readonly string[];
};

export type { CreateTeamDto };
