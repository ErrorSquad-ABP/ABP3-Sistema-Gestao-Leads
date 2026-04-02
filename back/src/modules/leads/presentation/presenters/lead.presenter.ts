import type { LeadResponseDto } from '../../application/dto/lead-response.dto.js';
import type { Lead } from '../../domain/entities/lead.entity.js';

class LeadPresenter {
	static toResponse(lead: Lead): LeadResponseDto {
		return {
			id: lead.id,
			customerId: lead.customerId,
			ownerUserId: lead.ownerUserId,
			source: lead.source.value,
			status: lead.status,
			storeId: lead.storeId,
		};
	}

	static toResponseList(leads: Lead[]): LeadResponseDto[] {
		return leads.map((lead) => LeadPresenter.toResponse(lead));
	}
}

export { LeadPresenter };
