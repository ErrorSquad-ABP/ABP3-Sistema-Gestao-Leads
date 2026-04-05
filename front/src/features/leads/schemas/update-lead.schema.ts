import type { UpdateLeadInput } from '../types/leads.types';

function parseUpdateLeadInput(input: UpdateLeadInput): UpdateLeadInput {
	return {
		customerId: input.customerId,
		storeId: input.storeId,
		ownerUserId: input.ownerUserId ?? null,
		source: input.source,
		status: input.status,
	};
}

export { parseUpdateLeadInput };
