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
	switch (status) {
		case 'AVAILABLE':
			return vehicleStatusLabels.AVAILABLE;
		case 'RESERVED':
			return vehicleStatusLabels.RESERVED;
		case 'SOLD':
			return vehicleStatusLabels.SOLD;
		case 'INACTIVE':
			return vehicleStatusLabels.INACTIVE;
		default: {
			const _exhaustive: never = status;
			return _exhaustive;
		}
	}
}

function formatSupportedFuelTypeLabel(value: SupportedFuelType) {
	switch (value) {
		case 'GASOLINE':
			return supportedFuelTypeLabels.GASOLINE;
		case 'ETHANOL':
			return supportedFuelTypeLabels.ETHANOL;
		case 'FLEX':
			return supportedFuelTypeLabels.FLEX;
		case 'DIESEL':
			return supportedFuelTypeLabels.DIESEL;
		case 'ELECTRIC':
			return supportedFuelTypeLabels.ELECTRIC;
		case 'HYBRID':
			return supportedFuelTypeLabels.HYBRID;
		case 'PLUG_IN_HYBRID':
			return supportedFuelTypeLabels.PLUG_IN_HYBRID;
		case 'CNG':
			return supportedFuelTypeLabels.CNG;
		default: {
			const _exhaustive: never = value;
			return _exhaustive;
		}
	}
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
