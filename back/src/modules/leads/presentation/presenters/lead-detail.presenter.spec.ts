import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { LeadDetailView } from '../../application/types/lead-detail-view.js';
import { LeadDetailPresenter } from './lead-detail.presenter.js';

const view: LeadDetailView = {
	lead: {
		id: '11111111-1111-4111-8111-111111111111',
		customerId: '22222222-2222-4222-8222-222222222222',
		storeId: '33333333-3333-4333-8333-333333333333',
		ownerUserId: '44444444-4444-4444-8444-444444444444',
		source: 'WEBSITE',
		status: 'NEGOTIATING',
		vehicleInterestText: 'SUV automatico',
		createdAt: new Date('2026-04-20T10:00:00.000Z'),
		updatedAt: new Date('2026-04-20T11:00:00.000Z'),
		customer: {
			id: '22222222-2222-4222-8222-222222222222',
			name: 'Cliente Teste',
			email: 'cliente@example.com',
			phone: '11999998888',
			cpf: null,
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
	},
	deals: [
		{
			id: '55555555-5555-4555-8555-555555555555',
			leadId: '11111111-1111-4111-8111-111111111111',
			vehicleId: '66666666-6666-4666-8666-666666666666',
			title: 'Negociacao principal',
			value: { toString: () => '120000.00' },
			importance: 'HIGH',
			stage: 'INITIAL_CONTACT',
			status: 'OPEN',
			closedAt: null,
			createdAt: new Date('2026-04-20T12:00:00.000Z'),
			updatedAt: new Date('2026-04-20T12:00:00.000Z'),
			vehicle: {
				id: '66666666-6666-4666-8666-666666666666',
				brand: 'Fiat',
				model: 'Toro',
				modelYear: 2023,
				plate: 'ABC1D23',
			},
		},
	],
	timelineEvents: [
		{
			kind: 'lead-event',
			row: {
				id: 'lead-event-1',
				leadId: '11111111-1111-4111-8111-111111111111',
				actorUserId: '44444444-4444-4444-8444-444444444444',
				type: 'UPDATED',
				title: 'Lead atualizado',
				description: 'Dados do lead atualizados.',
				payload: {
					changes: [
						{
							field: 'status',
							fromValue: 'NEW',
							toValue: 'CONTACTED',
							internalId: 'nao-deve-sair',
						},
					],
					ownerUserId: 'nao-deve-sair',
				},
				createdAt: new Date('2026-04-20T13:00:00.000Z'),
				actorUser: {
					id: '44444444-4444-4444-8444-444444444444',
					name: 'Atendente',
					email: 'atendente@example.com',
				},
			},
		},
		{
			kind: 'deal-history',
			row: {
				id: 'deal-history-1',
				dealId: '55555555-5555-4555-8555-555555555555',
				field: 'stage',
				fromValue: 'INITIAL_CONTACT',
				toValue: 'PROPOSAL',
				actorUserId: 'nao-deve-sair',
				createdAt: new Date('2026-04-20T14:00:00.000Z'),
				deal: {
					id: '55555555-5555-4555-8555-555555555555',
					title: 'Negociacao principal',
				},
			},
		},
		{
			kind: 'lead-event',
			row: {
				id: 'lead-event-reassigned',
				leadId: '11111111-1111-4111-8111-111111111111',
				actorUserId: '44444444-4444-4444-8444-444444444444',
				type: 'REASSIGNED',
				title: 'Lead reatribuído',
				description: 'Responsável operacional do lead foi alterado.',
				payload: {
					fromOwner: {
						name: 'Atendente antigo',
						email: 'antigo@example.com',
					},
					toOwner: {
						name: 'Atendente novo',
						email: 'novo@example.com',
					},
					fromOwnerUserId: 'nao-deve-sair',
					toOwnerUserId: 'nao-deve-sair',
				},
				createdAt: new Date('2026-04-20T15:00:00.000Z'),
				actorUser: {
					id: '44444444-4444-4444-8444-444444444444',
					name: 'Atendente',
					email: 'atendente@example.com',
				},
			},
		},
	],
	permissions: {
		canEdit: true,
		canReassign: true,
		canConvert: true,
		canManageDeals: true,
	},
};

describe('LeadDetailPresenter', () => {
	it('mapeia lead para contrato publico e ordena timeline por data desc', () => {
		const response = LeadDetailPresenter.toResponse(view);

		assert.equal(response.lead.source, 'digital-form');
		assert.equal(response.lead.status, 'QUALIFIED');
		assert.equal(response.deals[0]?.vehicleLabel, 'Fiat Toro 2023 · ABC1D23');
		assert.deepEqual(
			response.timeline.map((event) => event.id),
			['lead-event-reassigned', 'deal-history:deal-history-1', 'lead-event-1'],
		);
	});

	it('nao expoe payload bruto nem IDs internos na metadata', () => {
		const response = LeadDetailPresenter.toResponse(view);
		const leadEvent = response.timeline.find(
			(event) => event.id === 'lead-event-1',
		);
		const dealEvent = response.timeline.find((event) =>
			event.id.startsWith('deal-history:'),
		);

		assert.deepEqual(leadEvent?.metadata, {
			changes: [{ field: 'status', fromValue: 'NEW', toValue: 'CONTACTED' }],
		});
		assert.deepEqual(dealEvent?.metadata, {
			field: 'stage',
			fromValue: 'INITIAL_CONTACT',
			toValue: 'PROPOSAL',
		});
		assert.deepEqual(
			response.timeline.find((event) => event.id === 'lead-event-reassigned')
				?.metadata,
			{
				action: 'reassigned',
				fromOwner: {
					name: 'Atendente antigo',
					email: 'antigo@example.com',
				},
				toOwner: {
					name: 'Atendente novo',
					email: 'novo@example.com',
				},
			},
		);
		assert.equal(
			JSON.stringify(response.timeline).includes('nao-deve-sair'),
			false,
		);
	});
});
