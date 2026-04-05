import type { CreateLeadInput } from '../types/leads.types';

function parseCreateLeadInput(input: CreateLeadInput): CreateLeadInput {
	return {
		customerId: input.customerId,
		storeId: input.storeId,
		ownerUserId: input.ownerUserId ?? null,
		source: input.source,
	};
}

export { parseCreateLeadInput };
