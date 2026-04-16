class VehicleNotFoundError extends Error {
	readonly code = 'vehicle.not_found';

	constructor(vehicleId: string) {
		super(`Veículo não encontrado: ${vehicleId}`);
		this.name = 'VehicleNotFoundError';
	}
}

export { VehicleNotFoundError };
