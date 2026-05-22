import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

import { dealSchema, dealStages } from './deal.schema';

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

const dealsByLeadListDataSchema = z.object({
	items: z.array(dealSchema),
	canMutateLead: z.boolean(),
});

function parseDealsByLeadListResponse(data: unknown) {
	const parsed = dealsByLeadListDataSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'deals.invalid_by_lead_list_shape',
		});
	}
	return parsed.data;
}

const dealPipelineStageSchema = z.object({
	key: z.enum(dealStages),
	label: z.string(),
	count: z.number().int().min(0),
	totalValue: z.string().nullable(),
	page: z.number().int().min(1),
	pageSize: z.number().int().min(1).max(50),
	totalPages: z.number().int().min(0),
	hasNextPage: z.boolean(),
	items: z.array(dealSchema),
});

const dealPipelineResponseSchema = z.object({
	stages: z.array(dealPipelineStageSchema),
});

function parseDealPipelineResponse(data: unknown) {
	const parsed = dealPipelineResponseSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'deals.invalid_pipeline_response_shape',
		});
	}
	return parsed.data;
}

function parseDealPipelineStageResponse(data: unknown) {
	const parsed = dealPipelineStageSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'deals.invalid_pipeline_stage_response_shape',
		});
	}
	return parsed.data;
}

export {
	dealsByLeadListDataSchema,
	dealsPagedDataSchema,
	dealPipelineResponseSchema,
	dealPipelineStageSchema,
	parseDealPipelineResponse,
	parseDealPipelineStageResponse,
	parseDealsByLeadListResponse,
	parseDealsPagedResponse,
};
