import type { LeadTeam } from '@/features/leads/types/leads.types';

type TeamRecord = LeadTeam;

type TeamMutationInput = {
	name: string;
	storeId: string;
	managerId?: string | null;
};

type TeamUpdateInput = {
	name?: string;
	storeId?: string;
};

type TeamDialogMode = 'create' | 'edit';

export type { TeamDialogMode, TeamMutationInput, TeamRecord, TeamUpdateInput };
