import type { z } from 'zod';

import type {
	dealCreateSchema,
	dealUpdateSchema,
} from '../schemas/deal-management.schema';
import type {
	dealHistoryItemSchema,
	dealImportances,
	dealSchema,
	dealStages,
	dealStatuses,
} from '../schemas/deal.schema';
import type {
	dealPipelineResponseSchema,
	dealPipelineStageSchema,
} from '../schemas/deal-list.schema';

type DealPipelineSortMode = 'recent' | 'value_asc' | 'value_desc';

type Deal = z.infer<typeof dealSchema>;
type DealHistoryItem = z.infer<typeof dealHistoryItemSchema>;

type DealStatus = (typeof dealStatuses)[number];
type DealStage = (typeof dealStages)[number];
type DealImportance = (typeof dealImportances)[number];

type DealCreateInput = z.output<typeof dealCreateSchema>;
type DealCreateFormInput = z.input<typeof dealCreateSchema>;
type DealUpdateInput = z.output<typeof dealUpdateSchema>;
type DealUpdateFormInput = z.input<typeof dealUpdateSchema>;
type DealPipelineStage = z.infer<typeof dealPipelineStageSchema>;
type DealPipelineResponse = z.infer<typeof dealPipelineResponseSchema>;
type DealPipelineQuery = {
	status?: DealStatus;
	importance?: DealImportance;
	search?: string;
	pageSize: number;
	/** Presente na query string quando o modo de ordenação do funil não é “recent”. */
	valueSort?: 'asc' | 'desc';
};
type DealPipelineStageQuery = DealPipelineQuery & {
	stage: DealStage;
	page: number;
};

export type {
	Deal,
	DealCreateFormInput,
	DealCreateInput,
	DealHistoryItem,
	DealImportance,
	DealPipelineQuery,
	DealPipelineResponse,
	DealPipelineSortMode,
	DealPipelineStage,
	DealPipelineStageQuery,
	DealStage,
	DealStatus,
	DealUpdateFormInput,
	DealUpdateInput,
};
