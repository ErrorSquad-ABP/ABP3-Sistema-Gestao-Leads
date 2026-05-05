import { Injectable } from '@nestjs/common';

import type { DealImportance } from '../../../../shared/domain/enums/deal-importance.enum.js';
import {
	assertCanonicalDealStage,
	type DealStage,
} from '../../../../shared/domain/enums/deal-stage.enum.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadAccessPolicy } from '../../../leads/application/services/lead-access-policy.service.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import type {
	DealEnrichedRow,
	DealListScopedFilters,
	DealPipelineStagePage,
} from '../../domain/repositories/deal.repository.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { DealRepositoryFactory } from '../../infrastructure/persistence/factories/deal-repository.factory.js';

type DealPipelineQuery = {
	readonly status?: 'OPEN' | 'WON' | 'LOST';
	readonly importance?: DealImportance;
	readonly search?: string;
	readonly pageSize: number;
	readonly valueSort?: 'asc' | 'desc';
};

type DealPipelineStageQuery = DealPipelineQuery & {
	readonly stage: string;
	readonly page: number;
};

type DealPipelineStageResult = {
	readonly key: DealStage;
	readonly label: string;
	readonly count: number;
	readonly totalValue: string | null;
	readonly page: number;
	readonly pageSize: number;
	readonly totalPages: number;
	readonly hasNextPage: boolean;
	readonly items: readonly {
		readonly row: DealEnrichedRow;
		readonly canMutate: boolean;
	}[];
};

function getStageLabel(stage: DealStage): string {
	switch (stage) {
		case 'INITIAL_CONTACT':
			return 'Contato inicial';
		case 'NEGOTIATION':
			return 'Negociação';
		case 'PROPOSAL':
			return 'Proposta';
		case 'CLOSING':
			return 'Fechamento';
	}
}

@Injectable()
class ListDealPipelineUseCase {
	constructor(
		private readonly dealRepositoryFactory: DealRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	private async resolveScopedFilters(
		actor: LeadActor,
		query: Pick<
			DealPipelineQuery,
			'importance' | 'search' | 'status' | 'valueSort'
		>,
	): Promise<DealListScopedFilters> {
		const scope = await this.leadAccessPolicy.resolveCatalogScope(actor);
		const search = query.search?.trim() || undefined;

		if (scope.kind === 'full') {
			return {
				importance: query.importance,
				status: query.status,
				search,
				valueSort: query.valueSort,
			};
		}

		if (scope.kind === 'attendant') {
			return {
				ownerUserId: actor.userId,
				importance: query.importance,
				status: query.status,
				search,
				valueSort: query.valueSort,
			};
		}

		return {
			storeIds: [...scope.readStoreIds],
			importance: query.importance,
			status: query.status,
			search,
			valueSort: query.valueSort,
		};
	}

	private toPipelineStageResult(
		stagePage: DealPipelineStagePage,
		items: readonly {
			readonly row: DealEnrichedRow;
			readonly canMutate: boolean;
		}[],
	): DealPipelineStageResult {
		const key = assertCanonicalDealStage(stagePage.stage);

		return {
			key,
			label: getStageLabel(key),
			count: stagePage.total,
			totalValue: stagePage.totalValue,
			page: stagePage.page,
			pageSize: stagePage.limit,
			totalPages: stagePage.totalPages,
			hasNextPage: stagePage.page < stagePage.totalPages,
			items,
		};
	}

	private async attachMutateFlags(
		actor: LeadActor,
		stagePage: DealPipelineStagePage,
	): Promise<DealPipelineStageResult> {
		const rowsWithSnap = stagePage.items.map((row) => ({
			row,
			snap: row.lead
				? {
						storeId: row.lead.storeId,
						ownerUserId: row.lead.ownerUserId,
					}
				: null,
		}));
		const batchInput = rowsWithSnap
			.map(({ snap }) => snap)
			.filter(
				(s): s is { storeId: string; ownerUserId: string | null } => s !== null,
			);
		const batchResults =
			await this.leadAccessPolicy.batchCanMutateLeadSnapshots(
				actor,
				batchInput,
			);
		const batchIter = batchResults.values();
		const items = rowsWithSnap.map(({ row, snap }) => {
			if (!snap) {
				return { row, canMutate: false as const };
			}
			const next = batchIter.next();
			const canMutate = next.done ? false : Boolean(next.value);
			return { row, canMutate };
		});
		return this.toPipelineStageResult(stagePage, items);
	}

	private async attachMutateFlagsForStages(
		actor: LeadActor,
		stagePages: readonly DealPipelineStagePage[],
	): Promise<DealPipelineStageResult[]> {
		const flatSnapshots = stagePages.flatMap((stagePage) =>
			stagePage.items.map((row) =>
				row.lead
					? {
							storeId: row.lead.storeId,
							ownerUserId: row.lead.ownerUserId,
						}
					: null,
			),
		);
		const batchInput = flatSnapshots.filter(
			(s): s is { storeId: string; ownerUserId: string | null } => s !== null,
		);
		const batchResults =
			await this.leadAccessPolicy.batchCanMutateLeadSnapshots(
				actor,
				batchInput,
			);
		const batchIter = batchResults.values();
		const flatCanMutate = flatSnapshots.map((snapshot) => {
			if (snapshot === null) {
				return false;
			}
			const next = batchIter.next();
			return next.done ? false : Boolean(next.value);
		});

		let offset = 0;
		return stagePages.map((stagePage) => {
			const n = stagePage.items.length;
			const slice = flatCanMutate.slice(offset, offset + n);
			offset += n;
			const items = stagePage.items.map((row, idx) => ({
				row,
				canMutate: slice.at(idx) ?? false,
			}));
			return this.toPipelineStageResult(stagePage, items);
		});
	}

	async execute(actor: LeadActor, query: DealPipelineQuery) {
		const filters = await this.resolveScopedFilters(actor, query);
		const deals = this.dealRepositoryFactory.create();
		const stages = await deals.listPipelineStagesEnriched(filters, {
			page: 1,
			limit: query.pageSize,
		});

		return {
			stages: await this.attachMutateFlagsForStages(actor, stages),
		};
	}

	async executeStage(actor: LeadActor, query: DealPipelineStageQuery) {
		const stage = assertCanonicalDealStage(query.stage);
		const filters = await this.resolveScopedFilters(actor, query);
		const deals = this.dealRepositoryFactory.create();
		const stagePage = await deals.listPipelineStageEnriched(
			{ ...filters, stage },
			{
				page: query.page,
				limit: query.pageSize,
			},
		);

		return this.attachMutateFlags(actor, stagePage);
	}
}

export { ListDealPipelineUseCase };
export type {
	DealPipelineQuery,
	DealPipelineStageQuery,
	DealPipelineStageResult,
};
