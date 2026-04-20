import type { SupportedFuelType, VehicleStatus } from '../model/vehicles.model';

const vehicleStatusLabels: Record<VehicleStatus, string> = {
	AVAILABLE: 'Disponível',
	RESERVED: 'Reservado',
	SOLD: 'Vendido',
	INACTIVE: 'Inativo',
};

const supportedFuelTypeLabels: Record<SupportedFuelType, string> = {
	GASOLINE: 'Gasolina',
	ETHANOL: 'Etanol',
	FLEX: 'Flex',
	DIESEL: 'Diesel',
	ELECTRIC: 'Elétrico',
	HYBRID: 'Híbrido',
	PLUG_IN_HYBRID: 'Híbrido plug-in',
	CNG: 'GNV',
};

function formatVehicleStatusLabel(status: VehicleStatus) {
	return vehicleStatusLabels[status] ?? status;
}

function formatSupportedFuelTypeLabel(value: SupportedFuelType) {
	return supportedFuelTypeLabels[value] ?? value;
}

const vehicleStatusOptions = Object.entries(vehicleStatusLabels).map(
	([value, label]) => ({
		value: value as VehicleStatus,
		label,
	}),
);

const supportedFuelTypeOptions = Object.entries(supportedFuelTypeLabels).map(
	([value, label]) => ({
		value: value as SupportedFuelType,
		label,
	}),
);

export {
	formatSupportedFuelTypeLabel,
	formatVehicleStatusLabel,
	supportedFuelTypeOptions,
	vehicleStatusOptions,
};

