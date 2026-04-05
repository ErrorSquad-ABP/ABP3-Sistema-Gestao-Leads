import type { Lead } from '../types/leads.types';

function createLeadLabel(lead: Lead) {
	return `${lead.customer.name} - ${lead.store.name}`;
}

export { createLeadLabel };
