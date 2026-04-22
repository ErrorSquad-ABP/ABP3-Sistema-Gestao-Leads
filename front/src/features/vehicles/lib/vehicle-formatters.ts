import type { SupportedFuelType, VehicleStatus } from '../model/vehicles.model';
import {
	formatSupportedFuelTypeLabel,
	formatVehicleStatusLabel,
} from './vehicle-labels';

function formatVehiclePriceBRL(value: string) {
	const numberValue = Number(value);
	if (!Number.isFinite(numberValue)) {
		return value;
	}
	return numberValue.toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	});
}

function formatMileage(value: number) {
	return `${value.toLocaleString('pt-BR')} km`;
}

function formatVehicleStatus(value: VehicleStatus) {
	return formatVehicleStatusLabel(value);
}

function formatFuelType(value: SupportedFuelType) {
	return formatSupportedFuelTypeLabel(value);
}

export {
	formatFuelType,
	formatMileage,
	formatVehiclePriceBRL,
	formatVehicleStatus,
};
