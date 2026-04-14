type UpdateUserDto = {
	readonly name?: string;
	readonly email?: string;
	readonly password?: string;
	readonly role?: string;
	readonly teamId?: string | null;
	readonly accessGroupId?: string | null;
};

export type { UpdateUserDto };
