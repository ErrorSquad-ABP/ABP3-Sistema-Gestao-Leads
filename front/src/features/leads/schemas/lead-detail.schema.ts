import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

const leadDetailSchema = z.object({
	id: z.string().uuid(),
	customerId: z.string().uuid(),
	storeId: z.string().uuid(),
	ownerUserId: z.string().uuid().nullable(),
	source: z.string(),
	status: z.string(),
	vehicleInterestText: z.string().nullable(),
});

function parseLeadDetailResponse(data: unknown) {
	const parsed = leadDetailSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'leads.detail.invalid_response_shape',
		});
	}
	return parsed.data;
}

export { leadDetailSchema, parseLeadDetailResponse };
