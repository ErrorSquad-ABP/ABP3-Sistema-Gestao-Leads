import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

const dealStatuses = ['OPEN', 'WON', 'LOST'] as const;

const dealStages = [
	'INITIAL_CONTACT',
	'NEGOTIATION',
	'PROPOSAL',
	'CLOSING',
] as const;

const dealImportances = ['COLD', 'WARM', 'HOT'] as const;

const dealSchema = z.object({
	id: z.string().uuid(),
	leadId: z.string().uuid(),
	leadCustomerName: z.string(),
	vehicleId: z.string().uuid(),
	vehicleLabel: z.string(),
	title: z.string(),
	value: z.string().nullable(),
	importance: z.enum(dealImportances),
	stage: z.enum(dealStages),
	status: z.enum(dealStatuses),
	closedAt: z.coerce.date().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	canMutate: z.boolean(),
});

const dealHistoryItemSchema = z.object({
	id: z.string().uuid(),
	dealId: z.string().uuid(),
	field: z.string(),
	fromValue: z.string().nullable(),
	toValue: z.string(),
	actorUserId: z.string().uuid().nullable(),
	createdAt: z.coerce.date(),
});

function parseDealResponse(data: unknown) {
	const parsed = dealSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'deals.invalid_response_shape',
		});
	}
	return parsed.data;
}

function parseDealHistoryResponse(data: unknown) {
	const parsed = z.array(dealHistoryItemSchema).safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'deals.invalid_history_response_shape',
		});
	}
	return parsed.data;
}

export {
	dealHistoryItemSchema,
	dealImportances,
	dealSchema,
	dealStages,
	dealStatuses,
	parseDealHistoryResponse,
	parseDealResponse,
};
