import { leadsService } from '../api/leads.service';
import type {
	CreateLeadInput,
	ReassignLeadInput,
	UpdateLeadInput,
} from '../types/leads.types';

const leadsMutations = {
	convert(leadId: string) {
		return leadsService.convert(leadId);
	},
	create(input: CreateLeadInput) {
		return leadsService.create(input);
	},
	remove(leadId: string) {
		return leadsService.remove(leadId);
	},
	reassign(leadId: string, input: ReassignLeadInput) {
		return leadsService.reassign(leadId, input);
	},
	update(leadId: string, input: UpdateLeadInput) {
		return leadsService.update(leadId, input);
	},
};

export { leadsMutations };
