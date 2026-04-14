import type { AuthenticatedUser } from '@/features/login/types/login.types';

import type { LeadListItem } from '../types/leads.types';

type LeadsListScope =
	| { kind: 'owner'; id: string }
	| { kind: 'teams'; ids: readonly string[] }
	| { kind: 'all' }
	| { kind: 'none'; reason: 'no_teams' };

/**
 * IDs de equipa para `GET /api/leads/team/:id` (gestor: membro ∪ geridos).
 * `GENERAL_MANAGER` e `ADMINISTRATOR` usam `listAll` no cliente (`kind: 'all'`).
 */
function readableTeamIdsForLeadsList(user: AuthenticatedUser): string[] {
	if (user.role === 'MANAGER') {
		return [...new Set([...user.memberTeamIds, ...user.managedTeamIds])].sort();
	}
	return [];
}

/**
 * Escolhe estratégia de listagem no cliente (espelha `LeadAccessPolicy`).
 */
function resolveLeadsListScope(user: AuthenticatedUser): LeadsListScope | null {
	if (user.role === 'ATTENDANT') {
		return { kind: 'owner', id: user.id };
	}
	if (user.role === 'MANAGER') {
		const ids = readableTeamIdsForLeadsList(user);
		if (ids.length === 0) {
			return { kind: 'none', reason: 'no_teams' };
		}
		return { kind: 'teams', ids };
	}
	if (user.role === 'GENERAL_MANAGER' || user.role === 'ADMINISTRATOR') {
		return { kind: 'all' };
	}
	return null;
}

/** Junta listas por equipa sem duplicar `id` (mesmo lead em várias consultas). */
function mergeLeadListsById(lists: readonly LeadListItem[][]): LeadListItem[] {
	const map = new Map<string, LeadListItem>();
	for (const list of lists) {
		for (const item of list) {
			if (!map.has(item.id)) {
				map.set(item.id, item);
			}
		}
	}
	return [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export type { LeadsListScope };
export {
	mergeLeadListsById,
	readableTeamIdsForLeadsList,
	resolveLeadsListScope,
};
