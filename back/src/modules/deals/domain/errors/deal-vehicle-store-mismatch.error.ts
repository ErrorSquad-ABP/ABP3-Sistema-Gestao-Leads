class DealVehicleStoreMismatchError extends Error {
	readonly code = 'deal.vehicle.store_mismatch';

	constructor(vehicleId: string, leadId: string) {
		super(`Veículo ${vehicleId} não pertence à mesma store do lead ${leadId}`);
		this.name = 'DealVehicleStoreMismatchError';
	}
}

export { DealVehicleStoreMismatchError };
