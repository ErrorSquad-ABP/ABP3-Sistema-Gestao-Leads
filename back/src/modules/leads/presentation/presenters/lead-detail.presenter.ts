import type { LeadDetailResponseDto } from '../../application/dto/lead-detail-response.dto.js';
import type { LeadDetailView } from '../../application/types/lead-detail-view.js';
import type { LeadDetailDealRow } from '../../domain/repositories/lead-detail.repository.js';
import type {
	LeadEventPayload,
	LeadEventRow,
} from '../../domain/repositories/lead-event.repository.js';
import type {
	LeadSource,
	LeadStatus,
} from '../../../../generated/prisma/enums.js';
import {
	mapPrismaLeadSourceToDomain,
	mapPrismaLeadStatusToDomain,
} from '../../infrastructure/persistence/mappers/lead.mapper.js';

function formatVehicleLabel(row: LeadDetailDealRow) {
	const vehicle = row.vehicle;
	if (vehicle === null) {
		return 'Veículo não encontrado';
	}
	const brand = vehicle.brand.trim();
	const model = vehicle.model.trim();
	const plate = vehicle.plate?.trim() || 'Sem placa';
	return `${brand} ${model} ${vehicle.modelYear} · ${plate}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
	if (value === null || typeof value !== 'object' || Array.isArray(value)) {
		return null;
	}
	return value as Record<string, unknown>;
}

function onlyString(value: unknown) {
	return typeof value === 'string' ? value : undefined;
}

function safeOwner(value: unknown) {
	const record = asRecord(value);
	if (!record) {
		return null;
	}
	const name = onlyString(record.name);
	const email = onlyString(record.email);
	if (!name || !email) {
		return null;
	}
	return { name, email };
}

function formatLeadEventMetadata(row: LeadEventRow): LeadEventPayload | null {
	const payload = asRecord(row.payload);
	if (!payload) {
		return null;
	}
	if (row.type === 'UPDATED') {
		const changes = Array.isArray(payload.changes) ? payload.changes : [];
		const safeChanges = changes
			.map((change) => asRecord(change))
			.filter((change): change is Record<string, unknown> => change !== null)
			.map((change) => {
				const field = onlyString(change.field);
				if (
					field !== 'source' &&
					field !== 'status' &&
					field !== 'vehicleInterestText' &&
					field !== 'ownerUserId'
				) {
					return null;
				}
				if (field === 'ownerUserId') {
					return {
						field,
						fromLabel: onlyString(change.fromLabel) ?? 'Sem responsável',
						toLabel: onlyString(change.toLabel) ?? 'Sem responsável',
					};
				}
				return {
					field,
					fromValue: onlyString(change.fromValue) ?? null,
					toValue: onlyString(change.toValue) ?? null,
				};
			})
			.filter(
				(change): change is NonNullable<typeof change> => change !== null,
			);
		return safeChanges.length > 0 ? { changes: safeChanges } : null;
	}
	if (row.type === 'REASSIGNED') {
		return {
			action: 'reassigned',
			fromOwner: safeOwner(payload.fromOwner),
			toOwner: safeOwner(payload.toOwner),
		};
	}
	if (row.type === 'CONVERTED') {
		return { action: 'converted' };
	}
	return null;
}

function toLeadEventTimeline(row: LeadEventRow) {
	return {
		id: row.id,
		type: row.type,
		title: row.title,
		description: row.description,
		actor: row.actorUser
			? {
					id: row.actorUser.id,
					name: row.actorUser.name,
					email: row.actorUser.email,
				}
			: null,
		metadata: formatLeadEventMetadata(row),
		createdAt: row.createdAt,
	};
}

function toDealHistoryTimeline(
	row: Extract<
		LeadDetailView['timelineEvents'][number],
		{ kind: 'deal-history' }
	>['row'],
) {
	return {
		id: `deal-history:${row.id}`,
		type: 'DEAL_UPDATED',
		title: `Negociação atualizada: ${row.deal?.title ?? 'sem título'}`,
		description: `${row.field}: ${row.fromValue ?? 'vazio'} -> ${row.toValue}`,
		actor: null,
		metadata: {
			field: row.field,
			fromValue: row.fromValue,
			toValue: row.toValue,
		},
		createdAt: row.createdAt,
	};
}

class LeadDetailPresenter {
	static toResponse(view: LeadDetailView): LeadDetailResponseDto {
		return {
			lead: {
				id: view.lead.id,
				source: mapPrismaLeadSourceToDomain(view.lead.source as LeadSource),
				status: mapPrismaLeadStatusToDomain(view.lead.status as LeadStatus),
				vehicleInterestText: view.lead.vehicleInterestText,
				createdAt: view.lead.createdAt,
				updatedAt: view.lead.updatedAt,
			},
			customer: {
				id: view.lead.customer.id,
				name: view.lead.customer.name,
				email: view.lead.customer.email,
				phone: view.lead.customer.phone,
			},
			store: {
				id: view.lead.store.id,
				name: view.lead.store.name,
			},
			owner: view.lead.owner
				? {
						id: view.lead.owner.id,
						name: view.lead.owner.name,
						email: view.lead.owner.email,
					}
				: null,
			deals: view.deals.map((deal) => ({
				id: deal.id,
				leadId: deal.leadId,
				title: deal.title,
				value: deal.value === null ? null : deal.value.toString(),
				importance: deal.importance,
				stage: deal.stage,
				status: deal.status,
				vehicleLabel: formatVehicleLabel(deal),
				closedAt: deal.closedAt,
				createdAt: deal.createdAt,
				updatedAt: deal.updatedAt,
			})),
			timeline: view.timelineEvents
				.map((event) =>
					event.kind === 'lead-event'
						? toLeadEventTimeline(event.row)
						: toDealHistoryTimeline(event.row),
				)
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
			permissions: view.permissions,
		} as LeadDetailResponseDto;
	}
}

export { LeadDetailPresenter };
