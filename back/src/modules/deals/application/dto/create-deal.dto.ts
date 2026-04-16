class CreateDealDto {
	vehicleId!: string;
	title!: string;
	value!: string | null;
	importance?: string;
	stage?: string;
}

export { CreateDealDto };
