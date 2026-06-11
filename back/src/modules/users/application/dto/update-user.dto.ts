type UpdateUserDto = {
	readonly name?: string;
	readonly email?: string;
	readonly password?: string;
	readonly role?: string;
	readonly accessGroupIds?: readonly string[];
};

export type { UpdateUserDto };
