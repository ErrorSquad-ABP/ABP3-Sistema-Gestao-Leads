import { apiClient } from '@/src/lib/http/api-client';

import { parseCreateLeadInput } from '../schemas/create-lead.schema';
import { parseLead, parseLeadList } from '../schemas/lead.schema';
import { parseUpdateLeadInput } from '../schemas/update-lead.schema';
import type {
	CreateLeadInput,
	ReassignLeadInput,
	UpdateLeadInput,
} from '../types/leads.types';

const leadsResource = apiClient.createHttpResource('/leads');

const leadsService = {
	convert(leadId: string) {
		return apiClient.patch(`/leads/${leadId}/convert`, {}, parseLead);
	},
	create(input: CreateLeadInput) {
		return leadsResource.create(parseCreateLeadInput(input), parseLead);
	},
	findById(leadId: string) {
		return leadsResource.findById(leadId, parseLead);
	},
	listByOwner(ownerUserId: string) {
		return apiClient.get(`/leads/owner/${ownerUserId}`, parseLeadList);
	},
	listByTeam(teamId: string) {
		return apiClient.get(`/leads/team/${teamId}`, parseLeadList);
	},
	remove(leadId: string) {
		return leadsResource.remove(leadId);
	},
	reassign(leadId: string, input: ReassignLeadInput) {
		return apiClient.patch(`/leads/${leadId}/reassign`, input, parseLead);
	},
	update(leadId: string, input: UpdateLeadInput) {
		return leadsResource.update(leadId, parseUpdateLeadInput(input), parseLead);
	},
};

export { leadsService };
