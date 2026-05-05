import type { Uuid } from '../../../../shared/domain/types/identifiers.js';

type LeadEventType = 'CREATED' | 'UPDATED' | 'REASSIGNED' | 'CONVERTED';

type LeadEventActorRow = {
	readonly id: string;
	readonly name: string;
	readonly email: string;
};

type LeadEventPayload = Record<string, unknown>;

type LeadEventRow = {
	readonly id: string;
	readonly leadId: string;
	readonly actorUserId: string | null;
	readonly type: LeadEventType;
	readonly title: string;
	readonly description: string;
	readonly payload: LeadEventPayload | null;
	readonly createdAt: Date;
	readonly actorUser?: LeadEventActorRow | null;
};

type LeadEventAppendInput = {
	readonly leadId: Uuid;
	readonly actorUserId: Uuid | null;
	readonly type: LeadEventType;
	readonly title: string;
	readonly description: string;
	readonly payload?: LeadEventPayload | null;
};

interface ILeadEventRepository {
	append(input: LeadEventAppendInput): Promise<LeadEventRow>;
	listByLeadId(leadId: Uuid): Promise<readonly LeadEventRow[]>;
}

export type {
	ILeadEventRepository,
	LeadEventAppendInput,
	LeadEventPayload,
	LeadEventRow,
	LeadEventType,
};
