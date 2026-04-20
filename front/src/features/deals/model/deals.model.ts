import type { z } from 'zod';

import type { dealCreateSchema, dealUpdateSchema } from '../schemas/deal-management.schema';
import type {
	dealHistoryItemSchema,
	dealImportances,
	dealSchema,
	dealStages,
	dealStatuses,
} from '../schemas/deal.schema';

type Deal = z.infer<typeof dealSchema>;
type DealHistoryItem = z.infer<typeof dealHistoryItemSchema>;

type DealStatus = (typeof dealStatuses)[number];
type DealStage = (typeof dealStages)[number];
type DealImportance = (typeof dealImportances)[number];

type DealCreateInput = z.output<typeof dealCreateSchema>;
type DealCreateFormInput = z.input<typeof dealCreateSchema>;
type DealUpdateInput = z.output<typeof dealUpdateSchema>;
type DealUpdateFormInput = z.input<typeof dealUpdateSchema>;

export type {
	Deal,
	DealCreateFormInput,
	DealCreateInput,
	DealHistoryItem,
	DealImportance,
	DealStage,
	DealStatus,
	DealUpdateFormInput,
	DealUpdateInput,
};

