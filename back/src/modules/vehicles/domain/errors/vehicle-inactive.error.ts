class VehicleInactiveError extends Error {
	readonly code = 'vehicle.inactive';

	constructor(vehicleId: string) {
		super(`Veículo inativo: ${vehicleId}`);
		this.name = 'VehicleInactiveError';
	}
}

export { VehicleInactiveError };
