import { LeadResponseDto } from '../../application/dto/lead-response.dto.js';
import type { Lead } from '../../domain/entities/lead.entity.js';

class LeadPresenter {
	static toResponse(lead: Lead): LeadResponseDto {
		return {
			id: lead.id.value,
			customerId: lead.customerId.value,
			ownerUserId: lead.ownerUserId === null ? null : lead.ownerUserId.value,
			source: lead.source.value,
			status: lead.status,
			storeId: lead.storeId.value,
		} as LeadResponseDto;
	}

	static toResponseList(leads: Lead[]): LeadResponseDto[] {
		return leads.map((lead) => LeadPresenter.toResponse(lead));
	}
}

export { LeadPresenter };
