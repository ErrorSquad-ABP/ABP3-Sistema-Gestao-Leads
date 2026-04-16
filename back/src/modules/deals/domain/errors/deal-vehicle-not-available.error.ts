class DealVehicleNotAvailableError extends Error {
	readonly code = 'deal.vehicle.not_available';

	constructor(vehicleId: string, status: string) {
		super(
			`Veículo indisponível para negociação: ${vehicleId} (status=${status})`,
		);
		this.name = 'DealVehicleNotAvailableError';
	}
}

export { DealVehicleNotAvailableError };
