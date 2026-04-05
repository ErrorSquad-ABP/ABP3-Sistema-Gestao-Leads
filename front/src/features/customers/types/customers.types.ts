type CustomerSummary = {
	readonly id: string;
	readonly name: string;
	readonly email: string | null;
	readonly phone: string | null;
	readonly cpf: string | null;
};

export type { CustomerSummary };
