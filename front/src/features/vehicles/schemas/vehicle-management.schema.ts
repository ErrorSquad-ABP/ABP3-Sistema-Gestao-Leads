import { z } from 'zod';

import { supportedFuelTypes, vehicleStatuses } from './vehicle.schema';

const pricePattern = /^\d+(\.\d{2})$/;

const vehicleFormSchema = z.object({
	storeId: z.string().uuid('Informe uma loja válida.'),
	brand: z.string().trim().min(1, 'Informe a marca.'),
	model: z.string().trim().min(1, 'Informe o modelo.'),
	version: z.string().trim().nullable(),
	modelYear: z.coerce
		.number()
		.int('Informe um ano do modelo válido.')
		.min(1886, 'Informe um ano do modelo válido.'),
	manufactureYear: z
		.union([
			z.coerce
				.number()
				.int('Informe um ano de fabricação válido.')
				.min(1886, 'Informe um ano de fabricação válido.'),
			z.literal(''),
			z.null(),
			z.undefined(),
		])
		.transform((value) =>
			value === '' || value === undefined ? null : (value as number | null),
		),
	color: z
		.union([z.string().trim().min(1), z.literal(''), z.null(), z.undefined()])
		.transform((value) =>
			value === '' || value === undefined ? null : (value as string | null),
		),
	mileage: z.coerce
		.number()
		.int('Informe uma quilometragem válida.')
		.min(0, 'Informe uma quilometragem válida.'),
	supportedFuelType: z.enum(supportedFuelTypes, {
		message: 'Selecione um tipo de combustível válido.',
	}),
	price: z
		.string()
		.trim()
		.refine((value) => pricePattern.test(value), {
			message: 'Informe um preço no formato 45000.00.',
		}),
	status: z.enum(vehicleStatuses, {
		message: 'Selecione um status válido.',
	}),
	plate: z
		.union([z.string().trim().min(1), z.literal(''), z.null(), z.undefined()])
		.transform((value) =>
			value === '' || value === undefined ? null : (value as string | null),
		),
	vin: z
		.union([z.string().trim().min(1), z.literal(''), z.null(), z.undefined()])
		.transform((value) =>
			value === '' || value === undefined ? null : (value as string | null),
		),
});

export { vehicleFormSchema };
