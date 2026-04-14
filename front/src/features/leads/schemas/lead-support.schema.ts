import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

const leadCustomerSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string().email().nullable(),
	phone: z.string().nullable(),
	cpf: z.string().nullable(),
});

const leadStoreSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
});

const leadTeamSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	storeId: z.string().uuid(),
	managerId: z.string().uuid().nullable(),
	memberUserIds: z.array(z.string().uuid()),
});

const leadOwnerRecordSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string().email(),
	storeIds: z.array(z.string().uuid()),
});

const leadCustomersResponseSchema = z.array(leadCustomerSchema);
const leadStoresResponseSchema = z.array(leadStoreSchema);
const leadTeamsResponseSchema = z.array(leadTeamSchema);
const leadOwnersResponseSchema = z.array(leadOwnerRecordSchema);

function parseLeadCustomersResponse(data: unknown) {
	const parsed = leadCustomersResponseSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta de clientes em formato inesperado.', 502, {
			code: 'leads.customers.invalid_response_shape',
		});
	}
	return parsed.data;
}

function parseLeadStoresResponse(data: unknown) {
	const parsed = leadStoresResponseSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta de lojas em formato inesperado.', 502, {
			code: 'leads.stores.invalid_response_shape',
		});
	}
	return parsed.data;
}

function parseLeadTeamsResponse(data: unknown) {
	const parsed = leadTeamsResponseSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta de equipes em formato inesperado.', 502, {
			code: 'leads.teams.invalid_response_shape',
		});
	}
	return parsed.data;
}

function parseLeadOwnersResponse(data: unknown) {
	const parsed = leadOwnersResponseSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta de responsáveis em formato inesperado.', 502, {
			code: 'leads.owners.invalid_response_shape',
		});
	}
	return parsed.data;
}

export {
	leadCustomerSchema,
	leadCustomersResponseSchema,
	leadOwnerRecordSchema,
	leadOwnersResponseSchema,
	leadStoreSchema,
	leadStoresResponseSchema,
	leadTeamSchema,
	leadTeamsResponseSchema,
	parseLeadCustomersResponse,
	parseLeadOwnersResponse,
	parseLeadStoresResponse,
	parseLeadTeamsResponse,
};
