import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

import { dealSchema } from './deal.schema';

const dealsPagedDataSchema = z.object({
	items: z.array(dealSchema),
	page: z.number().int().min(1),
	limit: z.number().int().min(1).max(50),
	total: z.number().int().min(0),
	totalPages: z.number().int().min(0),
});

function parseDealsPagedResponse(data: unknown) {
	const parsed = dealsPagedDataSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'deals.invalid_paged_response_shape',
		});
	}
	return parsed.data;
}

export { dealsPagedDataSchema, parseDealsPagedResponse };
