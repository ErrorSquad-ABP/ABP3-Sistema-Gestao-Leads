import type {
	SupportedFuelType,
	Vehicle,
	VehicleStatus,
} from '../model/vehicles.model';
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

/** Uma linha legível para selects de negociação (criar/editar, hook de etiqueta). */
function formatVehicleDealSelectLabel(vehicle: Vehicle) {
	const plate = vehicle.plate ? vehicle.plate.trim() : '';
	return `${vehicle.brand} ${vehicle.model} ${vehicle.modelYear} · ${plate || 'Sem placa'}`;
}

export {
	formatFuelType,
	formatMileage,
	formatVehicleDealSelectLabel,
	formatVehiclePriceBRL,
	formatVehicleStatus,
};
