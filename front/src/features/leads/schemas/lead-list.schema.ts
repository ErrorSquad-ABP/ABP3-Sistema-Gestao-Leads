import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

/** Resposta `data` de listagens paginadas de leads. */
const leadListItemSchema = z.object({
	id: z.string().uuid(),
	customerId: z.string().uuid(),
	storeId: z.string().uuid(),
	ownerUserId: z.string().uuid().nullable(),
	source: z.string(),
	status: z.string(),
});

const leadListPagedDataSchema = z.object({
	items: z.array(leadListItemSchema),
	page: z.number().int().min(1),
	limit: z.number().int().min(1).max(10),
	total: z.number().int().min(0),
	totalPages: z.number().int().min(0),
});

function parseLeadListPagedResponse(data: unknown) {
	const parsed = leadListPagedDataSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'leads.invalid_response_shape',
		});
	}
	return parsed.data;
}

export {
	leadListItemSchema,
	leadListPagedDataSchema,
	parseLeadListPagedResponse,
};
