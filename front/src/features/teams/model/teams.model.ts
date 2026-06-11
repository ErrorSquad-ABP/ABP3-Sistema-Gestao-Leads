import type { LeadTeam } from '@/features/leads/model/leads.model';

type TeamRecord = LeadTeam;

type TeamMutationInput = {
	name: string;
	storeId: string;
	managerId?: string | null;
	initialMemberUserIds?: string[];
};

type TeamUpdateInput = {
	name?: string;
	storeId?: string;
};

type TeamMemberCandidate = {
	id: string;
	name: string;
	email: string;
};

type TeamDialogMode = 'create' | 'edit';

export type {
	TeamDialogMode,
	TeamMemberCandidate,
	TeamMutationInput,
	TeamRecord,
	TeamUpdateInput,
};
