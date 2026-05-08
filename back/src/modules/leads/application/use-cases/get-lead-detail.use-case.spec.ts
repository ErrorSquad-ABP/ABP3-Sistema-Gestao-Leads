import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LeadNotFoundError } from '../../domain/errors/lead-not-found.error.js';
import type {
	LeadDetailDealHistoryRow,
	LeadDetailDealRow,
	LeadDetailLeadRow,
} from '../../domain/repositories/lead-detail.repository.js';
import type { LeadEventRow } from '../../domain/repositories/lead-event.repository.js';
import { GetLeadDetailUseCase } from './get-lead-detail.use-case.js';

const LEAD_ID = '11111111-1111-4111-8111-111111111111';
const CUSTOMER_ID = '22222222-2222-4222-8222-222222222222';
const STORE_ID = '33333333-3333-4333-8333-333333333333';
const OWNER_ID = '44444444-4444-4444-8444-444444444444';
const NEXT_OWNER_ID = '77777777-7777-4777-8777-777777777777';
const DEAL_ID = '55555555-5555-4555-8555-555555555555';
const CREATED_AT = new Date('2026-04-20T10:00:00.000Z');

const leadRow: LeadDetailLeadRow = {
	id: LEAD_ID,
	customerId: CUSTOMER_ID,
	storeId: STORE_ID,
	ownerUserId: OWNER_ID,
	source: 'WEBSITE',
	status: 'NEW',
	vehicleInterestText: 'SUV automatico',
	createdAt: CREATED_AT,
	updatedAt: new Date('2026-04-20T11:00:00.000Z'),
	customer: {
		id: CUSTOMER_ID,
		name: 'Cliente Teste',
		email: 'cliente@example.com',
		phone: '11999998888',
		cpf: null,
	},
	store: {
		id: STORE_ID,
		name: 'Loja Centro',
	},
	owner: {
		id: OWNER_ID,
		name: 'Atendente',
		email: 'atendente@example.com',
	},
};

const dealRow: LeadDetailDealRow = {
	id: DEAL_ID,
	leadId: LEAD_ID,
	vehicleId: '66666666-6666-4666-8666-666666666666',
	title: 'Negociacao principal',
	value: { toString: () => '123000.50' },
	importance: 'MEDIUM',
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
};

const leadEventRow: LeadEventRow = {
	id: 'event-1',
	leadId: LEAD_ID,
	actorUserId: OWNER_ID,
	type: 'UPDATED',
	title: 'Lead atualizado',
	description: 'Dados do lead atualizados.',
	payload: {
		changes: [{ field: 'status', fromValue: 'NEW', toValue: 'CONTACTED' }],
	},
	createdAt: new Date('2026-04-20T13:00:00.000Z'),
	actorUser: {
		id: OWNER_ID,
		name: 'Atendente',
		email: 'atendente@example.com',
	},
};

const dealHistoryRow: LeadDetailDealHistoryRow = {
	id: 'history-1',
	dealId: DEAL_ID,
	field: 'stage',
	fromValue: 'INITIAL_CONTACT',
	toValue: 'PROPOSAL',
	actorUserId: OWNER_ID,
	createdAt: new Date('2026-04-20T14:00:00.000Z'),
	deal: {
		id: DEAL_ID,
		title: 'Negociacao principal',
	},
};

function buildUseCase(params: {
	readonly detail?: LeadDetailLeadRow | null;
	readonly deals?: readonly LeadDetailDealRow[];
	readonly events?: readonly LeadEventRow[];
	readonly dealHistory?: readonly LeadDetailDealHistoryRow[];
	readonly canMutate?: boolean;
	readonly ownerUsers?: readonly {
		readonly id: { readonly value: string };
		readonly name: { readonly value: string };
		readonly email: { readonly value: string };
	}[];
}) {
	const calls = {
		readPolicy: 0,
		mutatePolicy: 0,
		findLeadById: 0,
	};
	const uc = new GetLeadDetailUseCase(
		{
			create: () => ({
				findLeadById: async () => {
					calls.findLeadById += 1;
					return Object.hasOwn(params, 'detail')
						? (params.detail ?? null)
						: leadRow;
				},
				listDealsByLeadId: async () => params.deals ?? [dealRow],
				listDealHistoryByLeadId: async () =>
					params.dealHistory ?? [dealHistoryRow],
			}),
		} as never,
		{
			create: () => ({
				listByLeadId: async () => params.events ?? [leadEventRow],
			}),
		} as never,
		{
			create: () => ({
				listByIds: async () => params.ownerUsers ?? [],
			}),
		} as never,
		{
			assertCanReadLeadSnapshot: async () => {
				calls.readPolicy += 1;
			},
			canActorMutateLeadOnSnapshot: async () => {
				calls.mutatePolicy += 1;
				return params.canMutate ?? true;
			},
		} as never,
	);
	return { uc, calls };
}

describe('GetLeadDetailUseCase', () => {
	it('agrega detalhe, negociacoes, eventos e permissoes', async () => {
		const { uc, calls } = buildUseCase({});
		const view = await uc.execute(
			{ userId: OWNER_ID, role: 'ATTENDANT' },
			LEAD_ID,
		);

		assert.equal(calls.findLeadById, 1);
		assert.equal(calls.readPolicy, 1);
		assert.equal(calls.mutatePolicy, 1);
		assert.equal(view.lead.id, LEAD_ID);
		assert.equal(view.deals.length, 1);
		assert.equal(view.timelineEvents.length, 3);
		assert.deepEqual(view.permissions, {
			canEdit: true,
			canReassign: true,
			canConvert: true,
			canManageDeals: true,
		});
	});

	it('cria evento de criacao sintetico quando nao ha CREATED persistido', async () => {
		const { uc } = buildUseCase({ events: [] });
		const view = await uc.execute(
			{ userId: OWNER_ID, role: 'ATTENDANT' },
			LEAD_ID,
		);

		const created = view.timelineEvents.find(
			(event) =>
				event.kind === 'lead-event' &&
				event.row.id === `lead-created:${LEAD_ID}`,
		);
		assert.ok(created);
		if (created?.kind !== 'lead-event') {
			throw new Error('expected lead-event');
		}
		assert.equal(created.row.type, 'CREATED');
		assert.equal(created.row.createdAt, CREATED_AT);
	});

	it('nao duplica evento CREATED quando ele ja existe', async () => {
		const persistedCreated: LeadEventRow = {
			...leadEventRow,
			id: 'event-created',
			type: 'CREATED',
		};
		const { uc } = buildUseCase({ events: [persistedCreated] });
		const view = await uc.execute(
			{ userId: OWNER_ID, role: 'ATTENDANT' },
			LEAD_ID,
		);

		assert.equal(
			view.timelineEvents.filter(
				(event) => event.kind === 'lead-event' && event.row.type === 'CREATED',
			).length,
			1,
		);
	});

	it('bloqueia conversao quando lead ja esta convertido', async () => {
		const { uc } = buildUseCase({
			detail: { ...leadRow, status: 'CONVERTED' },
			canMutate: true,
		});
		const view = await uc.execute(
			{ userId: OWNER_ID, role: 'ATTENDANT' },
			LEAD_ID,
		);
		assert.equal(view.permissions.canConvert, false);
	});

	it('retorna not found quando o read model nao encontra lead', async () => {
		const { uc, calls } = buildUseCase({ detail: null });
		await assert.rejects(
			() => uc.execute({ userId: OWNER_ID, role: 'ATTENDANT' }, LEAD_ID),
			LeadNotFoundError,
		);
		assert.equal(calls.readPolicy, 0);
		assert.equal(calls.mutatePolicy, 0);
	});

	it('enriquece reatribuicao com nomes sem expor ids na timeline', async () => {
		const { uc } = buildUseCase({
			events: [
				{
					...leadEventRow,
					id: 'event-reassigned',
					type: 'REASSIGNED',
					payload: {
						fromOwnerUserId: OWNER_ID,
						toOwnerUserId: NEXT_OWNER_ID,
					},
				},
			],
			ownerUsers: [
				{
					id: { value: OWNER_ID },
					name: { value: 'Atendente antigo' },
					email: { value: 'antigo@example.com' },
				},
				{
					id: { value: NEXT_OWNER_ID },
					name: { value: 'Atendente novo' },
					email: { value: 'novo@example.com' },
				},
			],
		});

		const view = await uc.execute(
			{ userId: OWNER_ID, role: 'ATTENDANT' },
			LEAD_ID,
		);
		const event = view.timelineEvents.find(
			(item) =>
				item.kind === 'lead-event' && item.row.id === 'event-reassigned',
		);
		if (event?.kind !== 'lead-event') {
			throw new Error('expected reassigned lead event');
		}
		assert.deepEqual(event.row.payload, {
			fromOwner: {
				name: 'Atendente antigo',
				email: 'antigo@example.com',
			},
			toOwner: {
				name: 'Atendente novo',
				email: 'novo@example.com',
			},
		});
		assert.equal(JSON.stringify(event.row.payload).includes(OWNER_ID), false);
		assert.equal(
			JSON.stringify(event.row.payload).includes(NEXT_OWNER_ID),
			false,
		);
	});
});
