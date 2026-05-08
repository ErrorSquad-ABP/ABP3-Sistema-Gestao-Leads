import type {
	LeadDetailDealHistoryRow,
	LeadDetailDealRow,
	LeadDetailLeadRow,
} from '../../domain/repositories/lead-detail.repository.js';
import type { LeadEventRow } from '../../domain/repositories/lead-event.repository.js';

type LeadDerivedDealHistoryEvent = {
	readonly kind: 'deal-history';
	readonly row: LeadDetailDealHistoryRow;
};

type LeadTimelineSourceEvent =
	| { readonly kind: 'lead-event'; readonly row: LeadEventRow }
	| LeadDerivedDealHistoryEvent;

type LeadDetailView = {
	readonly lead: LeadDetailLeadRow;
	readonly deals: readonly LeadDetailDealRow[];
	readonly timelineEvents: readonly LeadTimelineSourceEvent[];
	readonly permissions: {
		readonly canEdit: boolean;
		readonly canReassign: boolean;
		readonly canConvert: boolean;
		readonly canManageDeals: boolean;
	};
};

export type { LeadDetailView, LeadTimelineSourceEvent };
