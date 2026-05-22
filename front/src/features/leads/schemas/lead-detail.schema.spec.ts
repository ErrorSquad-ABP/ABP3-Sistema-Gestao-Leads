import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '../../../lib/http/api-error';
import { parseLeadDetailHubResponse } from './lead-detail.schema';

const validHubResponse = {
	lead: {
		id: '11111111-1111-4111-8111-111111111111',
		source: 'digital-form',
		status: 'NEW',
		vehicleInterestText: 'SUV automatico',
		createdAt: '2026-04-20T10:00:00.000Z',
		updatedAt: '2026-04-20T11:00:00.000Z',
	},
	customer: {
		id: '22222222-2222-4222-8222-222222222222',
		name: 'Cliente Teste',
		email: 'cliente@example.com',
		phone: '11999998888',
	},
	store: {
		id: '33333333-3333-4333-8333-333333333333',
		name: 'Loja Centro',
	},
	owner: {
		id: '44444444-4444-4444-8444-444444444444',
		name: 'Atendente',
		email: 'atendente@example.com',
	},
	deals: [
		{
			id: '55555555-5555-4555-8555-555555555555',
			leadId: '11111111-1111-4111-8111-111111111111',
			title: 'Negociacao principal',
			value: '120000.00',
			importance: 'HIGH',
			stage: 'INITIAL_CONTACT',
			status: 'OPEN',
			vehicleLabel: 'Fiat Toro 2023 · ABC1D23',
			closedAt: null,
			createdAt: '2026-04-20T12:00:00.000Z',
			updatedAt: '2026-04-20T12:00:00.000Z',
		},
	],
	timeline: [
		{
			id: 'lead-event-1',
			type: 'UPDATED',
			title: 'Lead atualizado',
			description: 'Dados do lead atualizados.',
			actor: null,
			metadata: {
				changes: [{ field: 'status', fromValue: 'NEW', toValue: 'CONTACTED' }],
			},
			createdAt: '2026-04-20T13:00:00.000Z',
		},
	],
	permissions: {
		canEdit: true,
		canReassign: true,
		canConvert: true,
		canManageDeals: true,
	},
};

describe('parseLeadDetailHubResponse', () => {
	it('aceita contrato valido do hub de lead', () => {
		const parsed = parseLeadDetailHubResponse(validHubResponse);
		assert.equal(parsed.lead.id, validHubResponse.lead.id);
		assert.equal(Array.isArray(parsed.timeline[0]?.metadata?.changes), true);
	});

	it('lança ApiError 502 quando o contrato vem em formato inesperado', () => {
		assert.throws(
			() =>
				parseLeadDetailHubResponse({
					...validHubResponse,
					permissions: { canEdit: 'sim' },
				}),
			(error) =>
				error instanceof ApiError &&
				error.status === 502 &&
				error.code === 'leads.detail_hub.invalid_response_shape',
		);
	});
});
