import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

const vehicleStatuses = ['AVAILABLE', 'RESERVED', 'SOLD', 'INACTIVE'] as const;

const supportedFuelTypes = [
	'GASOLINE',
	'ETHANOL',
	'FLEX',
	'DIESEL',
	'ELECTRIC',
	'HYBRID',
	'PLUG_IN_HYBRID',
	'CNG',
] as const;

const vehicleSchema = z.object({
	id: z.string().uuid(),
	storeId: z.string().uuid(),
	brand: z.string(),
	model: z.string(),
	version: z.string().nullable(),
	modelYear: z.number().int(),
	manufactureYear: z.number().int().nullable(),
	color: z.string().nullable(),
	mileage: z.number().int(),
	supportedFuelType: z.enum(supportedFuelTypes),
	price: z.string(),
	status: z.enum(vehicleStatuses),
	plate: z.string().nullable(),
	vin: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

function parseVehicleResponse(data: unknown) {
	const parsed = vehicleSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'vehicles.invalid_response_shape',
		});
	}
	return parsed.data;
}

function parseVehiclesResponse(data: unknown) {
	const parsed = z.array(vehicleSchema).safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'vehicles.invalid_list_response_shape',
		});
	}
	return parsed.data;
}

export {
	parseVehicleResponse,
	parseVehiclesResponse,
	supportedFuelTypes,
	vehicleSchema,
	vehicleStatuses,
};
