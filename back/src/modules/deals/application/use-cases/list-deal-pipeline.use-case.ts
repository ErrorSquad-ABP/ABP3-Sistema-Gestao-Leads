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
		query: Pick<DealPipelineQuery, 'importance' | 'search' | 'status'>,
	): Promise<DealListScopedFilters> {
		const scope = await this.leadAccessPolicy.resolveCatalogScope(actor);
		const search = query.search?.trim() || undefined;

		if (scope.kind === 'full') {
			return { importance: query.importance, status: query.status, search };
		}

		if (scope.kind === 'attendant') {
			return {
				ownerUserId: actor.userId,
				importance: query.importance,
				status: query.status,
				search,
			};
		}

		return {
			storeIds: [...scope.readStoreIds],
			importance: query.importance,
			status: query.status,
			search,
		};
	}

	private async attachMutateFlags(
		actor: LeadActor,
		stagePage: DealPipelineStagePage,
	): Promise<DealPipelineStageResult> {
		const items = await Promise.all(
			stagePage.items.map(async (row) => {
				const lead = row.lead;
				if (!lead) {
					return { row, canMutate: false as const };
				}
				const canMutate =
					await this.leadAccessPolicy.canActorMutateLeadOnSnapshot(
						actor,
						lead.storeId,
						lead.ownerUserId,
					);
				return { row, canMutate };
			}),
		);
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

	async execute(actor: LeadActor, query: DealPipelineQuery) {
		const filters = await this.resolveScopedFilters(actor, query);
		const deals = this.dealRepositoryFactory.create();
		const stages = await deals.listPipelineStagesEnriched(filters, {
			page: 1,
			limit: query.pageSize,
		});

		return {
			stages: await Promise.all(
				stages.map((stagePage) => this.attachMutateFlags(actor, stagePage)),
			),
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
