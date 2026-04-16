class CreateDealDto {
	title!: string;
	value!: string | null;
	importance?: string;
	stage?: string;
}

export { CreateDealDto };
