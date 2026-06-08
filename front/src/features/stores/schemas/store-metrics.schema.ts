import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

const storeMetricsRecordSchema = z.object({
	storeId: z.string().uuid(),
	total: z.number().int().min(0),
	converted: z.number().int().min(0),
	openDeals: z.number().int().min(0),
	conversionRate: z.number().int().min(0).max(100),
	wonValue: z.number().min(0),
});

const storeMetricsResponseSchema = z.array(storeMetricsRecordSchema);

function parseStoreMetricsResponse(data: unknown) {
	const parsed = storeMetricsResponseSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError(
			'Resposta de metricas de lojas em formato inesperado.',
			502,
			{
				code: 'stores.metrics.invalid_response_shape',
			},
		);
	}
	return parsed.data;
}

export {
	parseStoreMetricsResponse,
	storeMetricsRecordSchema,
	storeMetricsResponseSchema,
};
