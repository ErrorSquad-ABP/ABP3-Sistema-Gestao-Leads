import type { z } from 'zod';

import type {
	dealCreateSchema,
	dealUpdateSchema,
} from '../schemas/deal-management.schema';
import type {
	dealHistoryItemSchema,
	dealImportances,
	dealLossReasons,
	dealSchema,
	dealStages,
	dealStatuses,
} from '../schemas/deal.schema';
import type {
	dealPipelineResponseSchema,
	dealPipelineStageSchema,
} from '../schemas/deal-list.schema';
import type { dealsMetricsSchema } from '../schemas/deal-metrics.schema';

type DealPipelineSortMode = 'recent' | 'value_asc' | 'value_desc';

type Deal = z.infer<typeof dealSchema>;
type DealHistoryItem = z.infer<typeof dealHistoryItemSchema>;

type DealStatus = (typeof dealStatuses)[number];
type DealStage = (typeof dealStages)[number];
type DealImportance = (typeof dealImportances)[number];
type DealLossReason = (typeof dealLossReasons)[number];

type DealCreateInput = z.output<typeof dealCreateSchema>;
type DealCreateFormInput = z.input<typeof dealCreateSchema>;
type DealUpdateInput = z.output<typeof dealUpdateSchema>;
type DealUpdateFormInput = z.input<typeof dealUpdateSchema>;
type DealPipelineStage = z.infer<typeof dealPipelineStageSchema>;
type DealPipelineResponse = z.infer<typeof dealPipelineResponseSchema>;
type DealsMetrics = z.infer<typeof dealsMetricsSchema>;
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
	DealLossReason,
	DealPipelineQuery,
	DealPipelineResponse,
	DealPipelineSortMode,
	DealPipelineStage,
	DealPipelineStageQuery,
	DealStage,
	DealStatus,
	DealsMetrics,
	DealUpdateFormInput,
	DealUpdateInput,
};
