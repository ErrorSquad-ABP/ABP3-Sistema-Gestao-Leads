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
const NON_ADMIN_MAX_RANGE_DAYS = 366;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const ACTIVE_LEAD_STATUS_KEYS = new Set(['NEW', 'CONTACTED', 'QUALIFIED']);

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
	readonly kpis: {
		readonly totalLeads: OperationalDashboardKpi;
		readonly activeLeads: OperationalDashboardKpi;
		readonly convertedLeads: OperationalDashboardKpi;
		readonly conversionRate: OperationalDashboardKpi;
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
	readonly trend: {
		readonly points: {
			readonly date: string;
			readonly totalLeads: number;
			readonly activeLeads: number;
			readonly convertedLeads: number;
			readonly conversionRate: number;
		}[];
	};
};

type OperationalDashboardKpi = {
	readonly value: number;
	readonly previousValue: number;
	readonly delta: number;
	readonly deltaPercentage: number | null;
	readonly deltaPoints: number | null;
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

		const period = this.resolvePeriod(input, actor.role);
		const dashboard = this.operationalDashboardRepositoryFactory.create();
		const dashboardScope =
			scope.kind === 'full'
				? {}
				: {
						storeIds: [...scope.readStoreIds],
					};
		const previousPeriod = this.resolvePreviousPeriod(period);
		const [aggregate, previousAggregate, trendPoints] = await Promise.all([
			dashboard.getOperationalAggregate({
				period: {
					startDate: period.startDate,
					endDate: period.endDate,
				},
				scope: dashboardScope,
			}),
			dashboard.getOperationalAggregate({
				period: {
					startDate: previousPeriod.startDate,
					endDate: previousPeriod.endDate,
				},
				scope: dashboardScope,
			}),
			dashboard.getOperationalTrend({
				period: {
					startDate: period.startDate,
					endDate: period.endDate,
				},
				scope: dashboardScope,
			}),
		]);

		const role =
			scope.kind === 'full'
				? ('ADMINISTRATOR' as const)
				: scope.kind === 'manager'
					? ('MANAGER' as const)
					: ('GENERAL_MANAGER' as const);
		const storeIds =
			scope.kind === 'full' ? null : [...scope.readStoreIds].sort();
		const currentActiveLeads = this.countStatuses(
			aggregate.byStatus,
			ACTIVE_LEAD_STATUS_KEYS,
		);
		const previousActiveLeads = this.countStatuses(
			previousAggregate.byStatus,
			ACTIVE_LEAD_STATUS_KEYS,
		);
		const currentConvertedLeads = this.countStatuses(
			aggregate.byStatus,
			new Set(['CONVERTED']),
		);
		const previousConvertedLeads = this.countStatuses(
			previousAggregate.byStatus,
			new Set(['CONVERTED']),
		);
		const currentConversionRate = this.computePercentage(
			currentConvertedLeads,
			aggregate.totalLeads,
		);
		const previousConversionRate = this.computePercentage(
			previousConvertedLeads,
			previousAggregate.totalLeads,
		);

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
			kpis: {
				totalLeads: this.toCountKpi(
					aggregate.totalLeads,
					previousAggregate.totalLeads,
				),
				activeLeads: this.toCountKpi(currentActiveLeads, previousActiveLeads),
				convertedLeads: this.toCountKpi(
					currentConvertedLeads,
					previousConvertedLeads,
				),
				conversionRate: this.toRateKpi(
					currentConversionRate,
					previousConversionRate,
				),
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
			trend: {
				points: trendPoints.map((point) => ({
					date: point.date,
					activeLeads: point.activeLeads,
					convertedLeads: point.convertedLeads,
					totalLeads: point.totalLeads,
					conversionRate: this.computePercentage(
						point.convertedLeads,
						point.totalLeads,
					),
				})),
			},
		};
	}

	private countStatuses(
		rows: readonly DashboardDistributionItem[],
		statuses: ReadonlySet<string>,
	): number {
		return rows.reduce(
			(total, item) => total + (statuses.has(item.key) ? item.count : 0),
			0,
		);
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

	private toCountKpi(
		value: number,
		previousValue: number,
	): OperationalDashboardKpi {
		const delta = value - previousValue;
		return {
			value,
			previousValue,
			delta,
			deltaPercentage:
				previousValue > 0
					? Number(((delta / previousValue) * 100).toFixed(2))
					: null,
			deltaPoints: null,
		};
	}

	private toRateKpi(
		value: number,
		previousValue: number,
	): OperationalDashboardKpi {
		const delta = Number((value - previousValue).toFixed(2));
		return {
			value,
			previousValue,
			delta,
			deltaPercentage: null,
			deltaPoints: delta,
		};
	}

	private resolvePreviousPeriod(period: {
		readonly startDate: Date;
		readonly endDate: Date;
		readonly days: number;
	}): {
		readonly startDate: Date;
		readonly endDate: Date;
	} {
		const duration = period.endDate.getTime() - period.startDate.getTime();
		return {
			startDate: new Date(period.startDate.getTime() - duration),
			endDate: new Date(period.startDate),
		};
	}

	private resolvePeriod(
		input: GetOperationalDashboardInput,
		role: LeadActor['role'],
	): {
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
			if (role !== 'ADMINISTRATOR' && days > NON_ADMIN_MAX_RANGE_DAYS) {
				throw new BadRequestException(
					'Usuários não administradores podem consultar no máximo um ano por vez.',
				);
			}
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
