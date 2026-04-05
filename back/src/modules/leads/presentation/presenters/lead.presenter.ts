import type { LeadResponseDto } from '../../application/dto/lead-response.dto.js';
import type { LeadDetailsView } from '../../infrastructure/queries/lead-details.query.js';

class LeadPresenter {
	static toResponse(lead: LeadDetailsView): LeadResponseDto {
		return {
			id: lead.id,
			customerId: lead.customerId,
			ownerUserId: lead.ownerUserId,
			source: lead.source,
			status: lead.status,
			storeId: lead.storeId,
			customer: lead.customer,
			store: lead.store,
			owner: lead.owner,
		} as LeadResponseDto;
	}

	static toResponseList(leads: readonly LeadDetailsView[]): LeadResponseDto[] {
		return leads.map((lead) => LeadPresenter.toResponse(lead));
	}
}

export { LeadPresenter };
