import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { DEAL_IMPORTANCES } from '../../../../shared/domain/enums/deal-importance.enum.js';
import { LEAD_STATUSES } from '../../../../shared/domain/enums/lead-status.enum.js';
import { ALLOWED_LEAD_SOURCES } from '../../../../shared/domain/value-objects/lead-source.value-object.js';
import { LeadAccessPolicy } from '../../../leads/application/services/lead-access-policy.service.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import { LeadAccessDeniedError } from '../../../leads/domain/errors/lead-access-denied.error.js';
import type {
	DashboardDistributionItem,
	DashboardStoreDistributionItem,
} from '../../domain/repositories/operational-dashboard.repository.js';
import { OperationalDashboardRepositoryFactory } from '../../infrastructure/persistence/factories/operational-dashboard-repository.factory.js';

const DEFAULT_LOOKBACK_DAYS = 30;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

type GetOperationalDashboardInput = {
	readonly startDate?: string;
	readonly endDate?: string;
};

type OperationalDashboardResult = {
	readonly period: {
		readonly startDate: string;
		readonly endDate: string;
		readonly days: number;
	};
	readonly scope: {
		readonly role: 'ADMINISTRATOR' | 'MANAGER' | 'GENERAL_MANAGER';
		readonly storeIds: string[] | null;
	};
	readonly totals: {
		readonly totalLeads: number;
		readonly totalLeadsWithOpenDeal: number;
	};
	readonly distributions: {
		readonly byStatus: {
			readonly key: string;
			readonly count: number;
			readonly percentage: number;
		}[];
		readonly bySource: {
			readonly key: string;
			readonly count: number;
			readonly percentage: number;
		}[];
		readonly byStore: {
			readonly storeId: string;
			readonly storeName: string;
			readonly count: number;
			readonly percentage: number;
		}[];
		readonly byImportance: {
			readonly key: string;
			readonly count: number;
			readonly percentage: number;
		}[];
	};
};

@Injectable()
class GetOperationalDashboardUseCase {
	constructor(
		@Inject(LeadAccessPolicy)
		private readonly leadAccessPolicy: LeadAccessPolicy,
		@Inject(OperationalDashboardRepositoryFactory)
		private readonly operationalDashboardRepositoryFactory: OperationalDashboardRepositoryFactory,
	) {}

	async execute(
		actor: LeadActor,
		input: GetOperationalDashboardInput,
	): Promise<OperationalDashboardResult> {
		const scope = await this.leadAccessPolicy.resolveCatalogScope(actor);
		if (scope.kind === 'attendant') {
			throw new LeadAccessDeniedError(
				'Dashboard operacional disponível apenas para MANAGER, GENERAL_MANAGER e ADMINISTRATOR.',
			);
		}

		const period = this.resolvePeriod(input);
		const dashboard = this.operationalDashboardRepositoryFactory.create();
		const aggregate = await dashboard.getOperationalAggregate({
			period: {
				startDate: period.startDate,
				endDate: period.endDate,
			},
			scope:
				scope.kind === 'full'
					? {}
					: {
							storeIds: [...scope.readStoreIds],
						},
		});

		const role =
			scope.kind === 'full'
				? ('ADMINISTRATOR' as const)
				: scope.kind === 'manager'
					? ('MANAGER' as const)
					: ('GENERAL_MANAGER' as const);
		const storeIds =
			scope.kind === 'full' ? null : [...scope.readStoreIds].sort();

		return {
			period: {
				startDate: period.startDate.toISOString(),
				endDate: period.endDate.toISOString(),
				days: period.days,
			},
			scope: {
				role,
				storeIds,
			},
			totals: {
				totalLeads: aggregate.totalLeads,
				totalLeadsWithOpenDeal: aggregate.totalLeadsWithOpenDeal,
			},
			distributions: {
				byStatus: this.toDistributionWithPercentage(
					aggregate.byStatus,
					aggregate.totalLeads,
					LEAD_STATUSES,
				),
				bySource: this.toDistributionWithPercentage(
					aggregate.bySource,
					aggregate.totalLeads,
					ALLOWED_LEAD_SOURCES,
				),
				byStore: this.toStoreDistributionWithPercentage(
					aggregate.byStore,
					aggregate.totalLeads,
				),
				byImportance: this.toDistributionWithPercentage(
					aggregate.byImportance,
					aggregate.totalLeadsWithOpenDeal,
					DEAL_IMPORTANCES,
				),
			},
		};
	}

	private toDistributionWithPercentage(
		rows: readonly DashboardDistributionItem[],
		baseTotal: number,
		order: readonly string[],
	): {
		readonly key: string;
		readonly count: number;
		readonly percentage: number;
	}[] {
		const mapped = new Map(rows.map((row) => [row.key, row.count]));
		return order.map((key) => {
			const count = mapped.get(key) ?? 0;
			return {
				key,
				count,
				percentage: this.computePercentage(count, baseTotal),
			};
		});
	}

	private toStoreDistributionWithPercentage(
		rows: readonly DashboardStoreDistributionItem[],
		baseTotal: number,
	): {
		readonly storeId: string;
		readonly storeName: string;
		readonly count: number;
		readonly percentage: number;
	}[] {
		return rows.map((row) => ({
			storeId: row.storeId,
			storeName: row.storeName,
			count: row.count,
			percentage: this.computePercentage(row.count, baseTotal),
		}));
	}

	private computePercentage(count: number, total: number): number {
		if (total <= 0) {
			return 0;
		}
		return Number(((count / total) * 100).toFixed(2));
	}

	private resolvePeriod(input: GetOperationalDashboardInput): {
		readonly startDate: Date;
		readonly endDate: Date;
		readonly days: number;
	} {
		const hasStart = input.startDate !== undefined;
		const hasEnd = input.endDate !== undefined;
		if (hasStart !== hasEnd) {
			throw new BadRequestException(
				'startDate e endDate devem ser informadas juntas.',
			);
		}

		if (hasStart && hasEnd) {
			const startDate = new Date(input.startDate as string);
			const endDate = new Date(input.endDate as string);
			if (
				Number.isNaN(startDate.getTime()) ||
				Number.isNaN(endDate.getTime()) ||
				startDate >= endDate
			) {
				throw new BadRequestException(
					'Intervalo de datas inválido: startDate deve ser anterior a endDate.',
				);
			}

			const days = Math.max(
				1,
				Math.ceil(
					(endDate.getTime() - startDate.getTime()) / MILLISECONDS_PER_DAY,
				),
			);
			return {
				startDate,
				endDate,
				days,
			};
		}

		const endDate = new Date();
		const startDate = new Date(
			endDate.getTime() - DEFAULT_LOOKBACK_DAYS * MILLISECONDS_PER_DAY,
		);
		return {
			startDate,
			endDate,
			days: DEFAULT_LOOKBACK_DAYS,
		};
	}
}

export { GetOperationalDashboardUseCase };
export type { GetOperationalDashboardInput };
