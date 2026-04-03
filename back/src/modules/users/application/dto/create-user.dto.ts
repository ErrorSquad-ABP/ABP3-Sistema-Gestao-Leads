type CreateUserDto = {
	readonly name: string;
	readonly email: string;
	readonly password: string;
	readonly role: string;
	readonly teamId: string | null;
};

export type { CreateUserDto };
