import { z } from 'zod';

import { dealImportances, dealStages, dealStatuses } from './deal.schema';

const pricePattern = /^\d+(\.\d{2})$/;

const dealCreateSchema = z.object({
	vehicleId: z.string().uuid('Informe um veículo válido.'),
	title: z.string().trim().min(1, 'Informe um título.'),
	value: z
		.union([z.string().trim(), z.literal(''), z.null(), z.undefined()])
		.transform((value) => {
			if (value === '' || value === undefined) {
				return null;
			}
			return value as string | null;
		})
		.refine((value) => value === null || pricePattern.test(value), {
			message: 'Informe um valor no formato 45000.00 ou deixe vazio.',
		}),
	importance: z
		.enum(dealImportances, {
			message: 'Selecione uma importância válida.',
		})
		.optional(),
	stage: z
		.enum(dealStages, {
			message: 'Selecione uma etapa válida.',
		})
		.optional(),
});

const dealUpdateSchema = z.object({
	vehicleId: z.string().uuid('Informe um veículo válido.').optional(),
	title: z.string().trim().min(1, 'Informe um título.').optional(),
	value: z
		.union([z.string().trim(), z.literal(''), z.null(), z.undefined()])
		.transform((value) => {
			if (value === '' || value === undefined) {
				return undefined;
			}
			return value as string | null;
		})
		.refine(
			(value) =>
				value === undefined || value === null || pricePattern.test(value),
			{
				message: 'Informe um valor no formato 45000.00 ou deixe vazio.',
			},
		),
	importance: z.enum(dealImportances).optional(),
	stage: z.enum(dealStages).optional(),
	status: z.enum(dealStatuses).optional(),
});

export { dealCreateSchema, dealUpdateSchema };
