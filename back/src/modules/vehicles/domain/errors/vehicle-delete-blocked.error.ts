class VehicleDeleteBlockedError extends Error {
	readonly code = 'vehicle.delete_blocked';

	readonly deals: number;

	private constructor(message: string, deals: number) {
		super(message);
		this.name = VehicleDeleteBlockedError.name;
		this.deals = deals;
	}

	static withCounts(
		vehicleId: string,
		deals: number,
	): VehicleDeleteBlockedError {
		const message =
			deals > 0
				? `Não é possível excluir o veículo "${vehicleId}": ainda existem ${deals} negociação(ões) vinculada(s).`
				: `Não é possível excluir o veículo "${vehicleId}": existem vínculos impedindo a exclusão.`;
		return new VehicleDeleteBlockedError(message, deals);
	}

	static fromReferentialIntegrityFailure(
		vehicleId: string,
	): VehicleDeleteBlockedError {
		return new VehicleDeleteBlockedError(
			`Não é possível excluir o veículo "${vehicleId}": existem registros vinculados (integridade referencial).`,
			0,
		);
	}
}

export { VehicleDeleteBlockedError };
