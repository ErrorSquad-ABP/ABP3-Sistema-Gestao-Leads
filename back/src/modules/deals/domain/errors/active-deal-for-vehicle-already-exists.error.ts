class ActiveDealForVehicleAlreadyExistsError extends Error {
	readonly code = 'deal.vehicle.active_already_exists';

	constructor(vehicleId: string) {
		super(`Este veículo já possui uma negociação aberta: ${vehicleId}`);
		this.name = 'ActiveDealForVehicleAlreadyExistsError';
	}
}

export { ActiveDealForVehicleAlreadyExistsError };
