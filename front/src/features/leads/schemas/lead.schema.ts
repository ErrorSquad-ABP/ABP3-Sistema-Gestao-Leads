import { parseCustomer } from '../../customers/schemas/customer.schema';
import { parseStore } from '../../stores/schemas/store.schema';
import { parseUser } from '../../users/schemas/user.schema';
import type { Lead } from '../types/leads.types';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function parseLead(value: unknown): Lead {
	if (!isRecord(value)) {
		throw new TypeError('Contrato HTTP inválido para lead.');
	}

	return {
		id: String(value.id),
		customerId: String(value.customerId),
		storeId: String(value.storeId),
		ownerUserId:
			value.ownerUserId === null || value.ownerUserId === undefined
				? null
				: String(value.ownerUserId),
		source: String(value.source) as Lead['source'],
		status: String(value.status) as Lead['status'],
		customer: parseCustomer(value.customer),
		store: parseStore(value.store),
		owner:
			value.owner === null || value.owner === undefined
				? null
				: parseUser(value.owner),
	};
}

function parseLeadList(value: unknown): Lead[] {
	if (!Array.isArray(value)) {
		throw new TypeError('Contrato HTTP inválido para lista de leads.');
	}

	return value.map(parseLead);
}

export { parseLead, parseLeadList };
