import { createDomainEnum } from './_shared/create-domain-enum.js';

const SUPPORTED_FUEL_TYPES = [
	'GASOLINE',
	'ETHANOL',
	'FLEX',
	'DIESEL',
	'ELECTRIC',
	'HYBRID',
	'PLUG_IN_HYBRID',
	'CNG',
] as const;

type SupportedFuelType = (typeof SUPPORTED_FUEL_TYPES)[number];

const supportedFuelTypeEnum = createDomainEnum({
	code: 'enum.supported_fuel_type.invalid_value',
	label: 'Supported fuel type',
	values: SUPPORTED_FUEL_TYPES,
	allowNormalization: false,
});

const isSupportedFuelType = supportedFuelTypeEnum.is;
const isCanonicalSupportedFuelType = supportedFuelTypeEnum.isCanonical;
const parseSupportedFuelType = supportedFuelTypeEnum.parse;
const parseCanonicalSupportedFuelType = supportedFuelTypeEnum.parseCanonical;
const assertSupportedFuelType = supportedFuelTypeEnum.assert;
const assertCanonicalSupportedFuelType = supportedFuelTypeEnum.assertCanonical;

export type { SupportedFuelType };
export {
	assertCanonicalSupportedFuelType,
	assertSupportedFuelType,
	isCanonicalSupportedFuelType,
	isSupportedFuelType,
	parseCanonicalSupportedFuelType,
	parseSupportedFuelType,
	SUPPORTED_FUEL_TYPES,
};
