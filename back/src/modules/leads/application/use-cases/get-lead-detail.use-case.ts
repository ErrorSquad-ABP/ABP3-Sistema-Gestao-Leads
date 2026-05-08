import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import { LeadNotFoundError } from '../../domain/errors/lead-not-found.error.js';
import type { LeadEventPayload } from '../../domain/repositories/lead-event.repository.js';
import type { LeadEventRow } from '../../domain/repositories/lead-event.repository.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadDetailRepositoryFactory } from '../../infrastructure/persistence/factories/lead-detail-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadEventRepositoryFactory } from '../../infrastructure/persistence/factories/lead-event-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadAccessPolicy } from '../services/lead-access-policy.service.js';
import type { LeadActor } from '../types/lead-actor.js';
import type { LeadTimelineSourceEvent } from '../types/lead-detail-view.js';

function ensureCreatedEvent(
	leadId: string,
	createdAt: Date,
	events: readonly LeadEventRow[],
): LeadEventRow[] {
	if (events.some((event) => event.type === 'CREATED')) {
		return [...events];
	}
	return [
		...events,
		{
			id: `lead-created:${leadId}`,
			leadId,
			actorUserId: null,
			type: 'CREATED',
			title: 'Lead criado',
			description: 'Lead registrado no fluxo operacional.',
			payload: null,
			createdAt,
			actorUser: null,
		},
	];
}

function asRecord(value: unknown): Record<string, unknown> | null {
	if (value === null || typeof value !== 'object' || Array.isArray(value)) {
		return null;
	}
	return value as Record<string, unknown>;
}

function onlyString(value: unknown) {
	return typeof value === 'string' ? value : null;
}

function collectOwnerIdsFromEvent(event: LeadEventRow): string[] {
	const payload = asRecord(event.payload);
	if (!payload) {
		return [];
	}
	const ids = [
		onlyString(payload.fromOwnerUserId),
		onlyString(payload.toOwnerUserId),
	];
	const changes = Array.isArray(payload.changes) ? payload.changes : [];
	for (const change of changes) {
		const record = asRecord(change);
		if (record?.field !== 'ownerUserId') {
			continue;
		}
		ids.push(onlyString(record.fromValue), onlyString(record.toValue));
	}
	return ids.filter((id): id is string => id !== null);
}

function ownerPayload(
	user: {
		readonly name: { readonly value: string };
		readonly email: { readonly value: string };
	} | null,
) {
	return user
		? {
				name: user.name.value,
				email: user.email.value,
			}
		: null;
}

function ownerLabel(
	user: {
		readonly name: { readonly value: string };
		readonly email: { readonly value: string };
	} | null,
) {
	return user ? `${user.name.value} · ${user.email.value}` : 'Sem responsável';
}

@Injectable()
class GetLeadDetailUseCase {
	constructor(
		private readonly leadDetailRepositoryFactory: LeadDetailRepositoryFactory,
		private readonly leadEventRepositoryFactory: LeadEventRepositoryFactory,
		private readonly userRepositoryFactory: UserRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	private async enrichOwnerMetadata(
		events: readonly LeadEventRow[],
	): Promise<LeadEventRow[]> {
		const ownerIds = [...new Set(events.flatMap(collectOwnerIdsFromEvent))];
		if (ownerIds.length === 0) {
			return [...events];
		}
		const users = this.userRepositoryFactory.create();
		const ownerRows = await users.listByIds(
			ownerIds.map((id) => Uuid.parse(id)),
		);
		const ownersById = new Map(ownerRows.map((user) => [user.id.value, user]));

		return events.map((event) => {
			const payload = asRecord(event.payload);
			if (!payload) {
				return event;
			}
			if (event.type === 'REASSIGNED') {
				const fromId = onlyString(payload.fromOwnerUserId);
				const toId = onlyString(payload.toOwnerUserId);
				return {
					...event,
					payload: {
						fromOwner: ownerPayload(
							fromId ? (ownersById.get(fromId) ?? null) : null,
						),
						toOwner: ownerPayload(toId ? (ownersById.get(toId) ?? null) : null),
					} satisfies LeadEventPayload,
				};
			}
			if (event.type !== 'UPDATED') {
				return event;
			}
			const changes = Array.isArray(payload.changes) ? payload.changes : [];
			const enrichedChanges = changes.map((change) => {
				const record = asRecord(change);
				if (record?.field !== 'ownerUserId') {
					return change;
				}
				const fromId = onlyString(record.fromValue);
				const toId = onlyString(record.toValue);
				return {
					field: 'ownerUserId',
					fromLabel: ownerLabel(
						fromId ? (ownersById.get(fromId) ?? null) : null,
					),
					toLabel: ownerLabel(toId ? (ownersById.get(toId) ?? null) : null),
				};
			});
			return {
				...event,
				payload: {
					...payload,
					changes: enrichedChanges,
				},
			};
		});
	}

	async execute(actor: LeadActor, leadId: string) {
		const id = Uuid.parse(leadId);
		const details = this.leadDetailRepositoryFactory.create();
		const detail = await details.findLeadById(id);
		if (!detail) {
			throw new LeadNotFoundError(leadId);
		}
		await this.leadAccessPolicy.assertCanReadLeadSnapshot(actor, {
			storeId: detail.storeId,
			ownerUserId: detail.ownerUserId,
		});

		const events = this.leadEventRepositoryFactory.create();
		const [deals, persistedEvents, dealHistory] = await Promise.all([
			details.listDealsByLeadId(id),
			events.listByLeadId(id),
			details.listDealHistoryByLeadId(id),
		]);

		const canMutate = await this.leadAccessPolicy.canActorMutateLeadOnSnapshot(
			actor,
			detail.storeId,
			detail.ownerUserId,
		);
		const leadEvents = await this.enrichOwnerMetadata(
			ensureCreatedEvent(detail.id, detail.createdAt, persistedEvents),
		);
		const timelineEvents: LeadTimelineSourceEvent[] = [
			...leadEvents.map((row) => ({ kind: 'lead-event' as const, row })),
			...dealHistory.map((row) => ({ kind: 'deal-history' as const, row })),
		];

		return {
			lead: detail,
			deals,
			timelineEvents,
			permissions: {
				canEdit: canMutate,
				canReassign: canMutate,
				canConvert: canMutate && detail.status !== 'CONVERTED',
				canManageDeals: canMutate,
			},
		};
	}
}

export { GetLeadDetailUseCase };
