import { createDomainEnum } from './_shared/create-domain-enum.js';

const VEHICLE_STATUSES = ['AVAILABLE', 'RESERVED', 'SOLD', 'INACTIVE'] as const;

type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

const vehicleStatusEnum = createDomainEnum({
	code: 'enum.vehicle_status.invalid_value',
	label: 'Vehicle status',
	values: VEHICLE_STATUSES,
	allowNormalization: false,
});

const isVehicleStatus = vehicleStatusEnum.is;
const isCanonicalVehicleStatus = vehicleStatusEnum.isCanonical;
const parseVehicleStatus = vehicleStatusEnum.parse;
const parseCanonicalVehicleStatus = vehicleStatusEnum.parseCanonical;
const assertVehicleStatus = vehicleStatusEnum.assert;
const assertCanonicalVehicleStatus = vehicleStatusEnum.assertCanonical;

export type { VehicleStatus };
export {
	assertCanonicalVehicleStatus,
	assertVehicleStatus,
	isCanonicalVehicleStatus,
	isVehicleStatus,
	parseCanonicalVehicleStatus,
	parseVehicleStatus,
	VEHICLE_STATUSES,
};
