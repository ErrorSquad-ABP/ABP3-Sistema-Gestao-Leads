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

const leadDetailHubSchema = z.object({
	lead: z.object({
		id: z.string().uuid(),
		source: z.string(),
		status: z.string(),
		vehicleInterestText: z.string().nullable(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	}),
	customer: z.object({
		id: z.string().uuid(),
		name: z.string(),
		email: z.string().nullable(),
		phone: z.string().nullable(),
	}),
	store: z.object({
		id: z.string().uuid(),
		name: z.string(),
	}),
	owner: z
		.object({
			id: z.string().uuid(),
			name: z.string(),
			email: z.string(),
		})
		.nullable(),
	deals: z.array(
		z.object({
			id: z.string().uuid(),
			leadId: z.string().uuid(),
			title: z.string(),
			value: z.string().nullable(),
			importance: z.string(),
			stage: z.string(),
			status: z.string(),
			vehicleLabel: z.string(),
			closedAt: z.string().datetime().nullable(),
			createdAt: z.string().datetime(),
			updatedAt: z.string().datetime(),
		}),
	),
	timeline: z.array(
		z.object({
			id: z.string(),
			type: z.string(),
			title: z.string(),
			description: z.string(),
			actor: z
				.object({
					id: z.string().uuid(),
					name: z.string(),
					email: z.string(),
				})
				.nullable(),
			metadata: z.record(z.string(), z.unknown()).nullable(),
			createdAt: z.string().datetime(),
		}),
	),
	permissions: z.object({
		canEdit: z.boolean(),
		canReassign: z.boolean(),
		canConvert: z.boolean(),
		canManageDeals: z.boolean(),
	}),
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

function parseLeadDetailHubResponse(data: unknown) {
	const parsed = leadDetailHubSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'leads.detail_hub.invalid_response_shape',
		});
	}
	return parsed.data;
}

export {
	leadDetailHubSchema,
	leadDetailSchema,
	parseLeadDetailHubResponse,
	parseLeadDetailResponse,
};
