type RegisterInput = {
	confirmPassword: string;
	email: string;
	name: string;
	password: string;
};

type ForgotPasswordInput = {
	email: string;
};

export type { ForgotPasswordInput, RegisterInput };
