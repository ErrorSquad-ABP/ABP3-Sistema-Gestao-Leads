import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

const dealsMetricsSchema = z.object({
	openDealsCount: z.number().int().min(0),
	wonDealsCount: z.number().int().min(0),
	lostDealsCount: z.number().int().min(0),
	totalPipelineValue: z.number().min(0),
	averageTicket: z.number().min(0),
	conversionRate: z.number().min(0).max(1),
});

function parseDealsMetricsResponse(data: unknown) {
	const parsed = dealsMetricsSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'deals.invalid_metrics_response_shape',
		});
	}
	return parsed.data;
}

export { dealsMetricsSchema, parseDealsMetricsResponse };
