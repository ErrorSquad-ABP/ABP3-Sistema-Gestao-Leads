class CreateVehicleDto {
	storeId!: string;
	brand!: string;
	model!: string;
	version?: string | null;
	modelYear!: number;
	manufactureYear?: number | null;
	color?: string | null;
	mileage!: number;
	supportedFuelType!: string;
	price!: string;
	status?: string;
	plate?: string | null;
	vin?: string | null;
}

export { CreateVehicleDto };
