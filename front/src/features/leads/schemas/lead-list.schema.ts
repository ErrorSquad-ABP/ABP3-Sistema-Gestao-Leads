import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

/** Resposta `data` de `GET /api/leads/owner/:id` e `GET /api/leads/team/:id`. */
const leadListItemSchema = z.object({
	id: z.string().uuid(),
	customerId: z.string().uuid(),
	storeId: z.string().uuid(),
	ownerUserId: z.string().uuid().nullable(),
	source: z.string(),
	status: z.string(),
});

const leadListResponseSchema = z.array(leadListItemSchema);

function parseLeadListResponse(data: unknown) {
	const parsed = leadListResponseSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'leads.invalid_response_shape',
		});
	}
	return parsed.data;
}

export { leadListItemSchema, leadListResponseSchema, parseLeadListResponse };
