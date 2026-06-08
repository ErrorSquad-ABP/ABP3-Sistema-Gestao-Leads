import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type {
	AnalyticDashboardKpi,
	AnalyticDashboardResult,
	AnalyticDistributionItem,
	AnalyticDrillDownLead,
	AnalyticPerformanceItem,
	AnalyticTrendPoint,
	AnalyticsRankingOptions,
	AnalyticsScope,
	AnalyticsTimeRange,
	IAnalyticDashboardRepository,
} from '../../../domain/repositories/analytic-dashboard.repository.js';

type PrismaLeadRow = Prisma.LeadGetPayload<{
	select: {
		id: true;
		storeId: true;
		status: true;
		createdAt: true;
		updatedAt: true;
		customer: {
			select: {
				name: true;
			};
		};
		owner: {
			select: {
				id: true;
				name: true;
				memberTeams: { select: { id: true; name: true; storeId: true } };
				managedTeams: { select: { id: true; name: true; storeId: true } };
			};
		};
	};
}>;

type DealCountsByLead = {
	openDeals: number;
	wonDeals: number;
	lostDeals: number;
};

type Counter = {
	totalLeads: number;
	convertedLeads: number;
	notConvertedLeads: number;
	lostLeads: number;
	openDeals: number;
	wonDeals: number;
	lostDeals: number;
};

type Aggregate = {
	totalLeads: number;
	convertedLeads: number;
	notConvertedLeads: number;
	lostLeads: number;
	finalizedLeads: number;
	conversionRate: number;
	averageTimeToFirstInteractionHours: number | null;
	leadsWithInteraction: number;
	byAttendant: AnalyticPerformanceItem[];
	byTeam: AnalyticPerformanceItem[];
	importanceDistribution: AnalyticDistributionItem[];
	finalizationReasons: AnalyticDistributionItem[];
	trendPoints: AnalyticTrendPoint[];
	importanceLeads: AnalyticDrillDownLead[];
	conversionLeads: AnalyticDrillDownLead[];
};

const FIRST_INTERACTION_METHODOLOGY =
	'Aproximacao baseada no primeiro evento operacional registrado, na primeira negociacao criada ou, sem esses registros, em updatedAt do lead.';
const DAY_IN_MS = 86_400_000;
const DRILL_DOWN_LIMIT = 50;
const IMPORTANCE_RANK: Record<string, number> = {
	HOT: 3,
	WARM: 2,
	COLD: 1,
};

function emptyCounter(): Counter {
	return {
		totalLeads: 0,
		convertedLeads: 0,
		notConvertedLeads: 0,
		lostLeads: 0,
		openDeals: 0,
		wonDeals: 0,
		lostDeals: 0,
	};
}

function round2(value: number): number {
	return Math.round(value * 100) / 100;
}

function toRate(numerator: number, denominator: number): number {
	if (denominator <= 0) {
		return 0;
	}
	return round2((numerator / denominator) * 100);
}

function toDateKey(value: Date): string {
	return value.toISOString().slice(0, 10);
}

function previousTimeRange(timeRange: AnalyticsTimeRange): AnalyticsTimeRange {
	const duration =
		timeRange.endExclusive.getTime() - timeRange.startAt.getTime();
	const startAt = new Date(timeRange.startAt.getTime() - duration);
	const endExclusive = new Date(timeRange.startAt.getTime());
	return {
		mode: timeRange.mode,
		startAt,
		endExclusive,
		startDate: toDateKey(startAt),
		endDate: toDateKey(new Date(endExclusive.getTime() - DAY_IN_MS)),
	};
}

function toKpi(
	value: number,
	previousValue: number,
	options: { readonly asRate?: boolean } = {},
): AnalyticDashboardKpi {
	const delta = round2(value - previousValue);
	return {
		value,
		previousValue,
		delta,
		deltaPercentage:
			previousValue === 0
				? value === 0
					? 0
					: null
				: round2((delta / previousValue) * 100),
		...(options.asRate ? { deltaPoints: delta } : {}),
	};
}

function resolvePrimaryTeam(
	lead: PrismaLeadRow,
	visibleTeamIds?: ReadonlySet<string>,
): { readonly id: string; readonly name: string } | null {
	const owner = lead.owner;
	if (!owner) {
		return null;
	}

	const candidates = [...owner.memberTeams, ...owner.managedTeams]
		.filter((team) => team.storeId === lead.storeId)
		.filter(
			(team) => visibleTeamIds === undefined || visibleTeamIds.has(team.id),
		)
		.sort((left, right) => left.name.localeCompare(right.name));

	const chosen = candidates[0];
	return chosen ? { id: chosen.id, name: chosen.name } : null;
}

function toPerformanceItems(
	source: Map<
		string,
		{ readonly id: string; readonly name: string; counter: Counter }
	>,
	limit?: number,
): AnalyticPerformanceItem[] {
	const items = [...source.values()]
		.map((item) => {
			const finalizedLeads =
				item.counter.convertedLeads + item.counter.lostLeads;
			return {
				id: item.id,
				name: item.name,
				totalLeads: item.counter.totalLeads,
				convertedLeads: item.counter.convertedLeads,
				notConvertedLeads: item.counter.notConvertedLeads,
				conversionRate: toRate(item.counter.convertedLeads, finalizedLeads),
				openDeals: item.counter.openDeals,
				wonDeals: item.counter.wonDeals,
				lostDeals: item.counter.lostDeals,
			};
		})
		.sort((left, right) => {
			if (right.conversionRate !== left.conversionRate) {
				return right.conversionRate - left.conversionRate;
			}
			if (right.convertedLeads !== left.convertedLeads) {
				return right.convertedLeads - left.convertedLeads;
			}
			if (right.totalLeads !== left.totalLeads) {
				return right.totalLeads - left.totalLeads;
			}
			return left.name.localeCompare(right.name);
		});

	return limit === undefined ? items : items.slice(0, limit);
}

function buildDealCountsByLead(
	groups: readonly {
		leadId: string;
		status: string;
		_count: { _all: number };
	}[],
): Map<string, DealCountsByLead> {
	const counters = new Map<string, DealCountsByLead>();

	for (const group of groups) {
		const counter = counters.get(group.leadId) ?? {
			openDeals: 0,
			wonDeals: 0,
			lostDeals: 0,
		};

		if (group.status === 'OPEN') counter.openDeals = group._count._all;
		if (group.status === 'WON') counter.wonDeals = group._count._all;
		if (group.status === 'LOST') counter.lostDeals = group._count._all;
		counters.set(group.leadId, counter);
	}

	return counters;
}

function buildFirstInteractionMap(
	groups: readonly { leadId: string; _min: { createdAt: Date | null } }[],
): Map<string, Date> {
	return new Map(
		groups
			.filter(
				(group): group is { leadId: string; _min: { createdAt: Date } } =>
					group._min.createdAt instanceof Date,
			)
			.map((group) => [group.leadId, group._min.createdAt] as const),
	);
}

class AnalyticDashboardPrismaRepository
	implements IAnalyticDashboardRepository
{
	constructor(private readonly prisma: PrismaService) {}

	async getAnalyticDashboard(
		scope: AnalyticsScope,
		timeRange: AnalyticsTimeRange,
		options?: AnalyticsRankingOptions,
	): Promise<AnalyticDashboardResult> {
		const current = await this.loadAggregate(scope, timeRange, {
			...options,
			includeDrillDown: true,
		});
		const previous = await this.loadAggregate(
			scope,
			previousTimeRange(timeRange),
			{ ...options, includeDrillDown: false },
		);

		return {
			summary: {
				totalLeads: current.totalLeads,
				convertedLeads: current.convertedLeads,
				notConvertedLeads: current.notConvertedLeads,
				lostLeads: current.lostLeads,
				finalizedLeads: current.finalizedLeads,
				conversionRate: current.conversionRate,
			},
			kpis: {
				conversionRate: toKpi(current.conversionRate, previous.conversionRate, {
					asRate: true,
				}),
				convertedLeads: toKpi(current.convertedLeads, previous.convertedLeads),
				lostLeads: toKpi(current.lostLeads, previous.lostLeads),
				averageTimeToFirstInteraction: toKpi(
					current.averageTimeToFirstInteractionHours ?? 0,
					previous.averageTimeToFirstInteractionHours ?? 0,
				),
			},
			trend: { points: current.trendPoints },
			byAttendant: current.byAttendant,
			byTeam: current.byTeam,
			importanceDistribution: current.importanceDistribution,
			finalizationReasons: current.finalizationReasons,
			averageTimeToFirstInteraction: {
				hours: current.averageTimeToFirstInteractionHours,
				leadsWithInteraction: current.leadsWithInteraction,
				isApproximate: true,
				methodology: FIRST_INTERACTION_METHODOLOGY,
			},
			drillDown: {
				importanceLeads: current.importanceLeads,
				conversionLeads: current.conversionLeads,
			},
		};
	}

	private async loadAggregate(
		scope: AnalyticsScope,
		timeRange: AnalyticsTimeRange,
		options?: AnalyticsRankingOptions & { readonly includeDrillDown?: boolean },
	): Promise<Aggregate> {
		const leadWhere = this.buildLeadWhere(scope, timeRange);
		const dealWhere: Prisma.DealWhereInput = { lead: leadWhere };

		const [
			importanceGroups,
			lostDeals,
			dealStatusByLead,
			firstDealByLead,
			firstLeadEventByLead,
			leads,
			dealsWithImportance,
		] = await Promise.all([
			this.prisma.deal.groupBy({
				by: ['importance'],
				_count: { _all: true },
				where: dealWhere,
			}),
			this.prisma.deal.findMany({
				where: {
					...dealWhere,
					status: 'LOST',
					lead: {
						...leadWhere,
						status: { not: 'CONVERTED' },
					},
				},
				select: { leadId: true, lossReason: true },
			}),
			this.prisma.deal.groupBy({
				by: ['leadId', 'status'],
				_count: { _all: true },
				where: dealWhere,
			}),
			this.prisma.deal.groupBy({
				by: ['leadId'],
				_min: { createdAt: true },
				where: dealWhere,
			}),
			this.prisma.leadEvent.groupBy({
				by: ['leadId'],
				_min: { createdAt: true },
				where: {
					lead: leadWhere,
					type: { in: ['UPDATED', 'REASSIGNED', 'CONVERTED'] },
				},
			}),
			this.prisma.lead.findMany({
				where: leadWhere,
				select: {
					id: true,
					storeId: true,
					status: true,
					createdAt: true,
					updatedAt: true,
					customer: {
						select: {
							name: true,
						},
					},
					owner: {
						select: {
							id: true,
							name: true,
							memberTeams: {
								select: { id: true, name: true, storeId: true },
							},
							managedTeams: {
								select: { id: true, name: true, storeId: true },
							},
						},
					},
				},
			}),
			options?.includeDrillDown === false
				? Promise.resolve([])
				: this.prisma.deal.findMany({
						where: dealWhere,
						select: {
							importance: true,
							leadId: true,
							lead: {
								select: {
									id: true,
									customer: {
										select: {
											name: true,
										},
									},
								},
							},
						},
						orderBy: { updatedAt: 'desc' },
					}),
		]);

		const lostLeadIds = new Set(lostDeals.map((deal) => deal.leadId));
		const totalLeads = leads.length;
		const convertedLeads = leads.filter(
			(lead) => lead.status === 'CONVERTED',
		).length;
		const lostLeads = lostLeadIds.size;
		const finalizedLeads = convertedLeads + lostLeads;
		const notConvertedLeads = totalLeads - convertedLeads;
		const conversionRate = toRate(convertedLeads, finalizedLeads);

		const attendantCounters = new Map<
			string,
			{ readonly id: string; readonly name: string; counter: Counter }
		>();
		const teamCounters = new Map<
			string,
			{ readonly id: string; readonly name: string; counter: Counter }
		>();

		const visibleTeamIds =
			scope.kind === 'manager' ? new Set(scope.readTeamIds) : undefined;
		const dealCountsByLead = buildDealCountsByLead(dealStatusByLead);
		const firstDealAtByLead = buildFirstInteractionMap(firstDealByLead);
		const firstLeadEventAtByLead =
			buildFirstInteractionMap(firstLeadEventByLead);

		let interactionLeadCount = 0;
		let interactionTotalHours = 0;
		const trendBuckets = this.emptyTrendBuckets(timeRange);

		for (const lead of leads) {
			const isConverted = lead.status === 'CONVERTED';
			const isLost = lostLeadIds.has(lead.id);
			const dealCounts = dealCountsByLead.get(lead.id);
			const interactionAt = this.resolveFirstInteractionAt({
				lead,
				firstDealAt: firstDealAtByLead.get(lead.id) ?? null,
				firstLeadEventAt: firstLeadEventAtByLead.get(lead.id) ?? null,
			});
			const interactionHours =
				interactionAt === null
					? null
					: (interactionAt.getTime() - lead.createdAt.getTime()) / 3_600_000;

			if (interactionHours !== null) {
				interactionLeadCount += 1;
				interactionTotalHours += interactionHours;
			}

			this.incrementCounter(
				attendantCounters,
				lead.owner?.id ?? '__unassigned__',
				lead.owner?.name ?? 'Sem responsavel',
				isConverted,
				isLost,
				dealCounts,
			);

			const primaryTeam = resolvePrimaryTeam(lead, visibleTeamIds);
			this.incrementCounter(
				teamCounters,
				primaryTeam?.id ?? '__no_team__',
				primaryTeam?.name ?? 'Sem equipe',
				isConverted,
				isLost,
				dealCounts,
			);

			const bucket = trendBuckets.get(toDateKey(lead.createdAt));
			if (bucket) {
				bucket.totalLeads += 1;
				bucket.convertedLeads += isConverted ? 1 : 0;
				bucket.lostLeads += isLost ? 1 : 0;
				if (interactionHours !== null) {
					bucket.interactionLeadCount += 1;
					bucket.interactionTotalHours += interactionHours;
				}
			}
		}

		return {
			totalLeads,
			convertedLeads,
			notConvertedLeads,
			lostLeads,
			finalizedLeads,
			conversionRate,
			averageTimeToFirstInteractionHours:
				interactionLeadCount === 0
					? null
					: round2(interactionTotalHours / interactionLeadCount),
			leadsWithInteraction: interactionLeadCount,
			byAttendant: toPerformanceItems(attendantCounters, options?.top),
			byTeam: toPerformanceItems(teamCounters, options?.top),
			importanceDistribution: this.toImportanceDistribution(importanceGroups),
			finalizationReasons: this.toFinalizationReasons(lostDeals),
			trendPoints: this.toTrendPoints(trendBuckets),
			importanceLeads: options?.includeDrillDown === false ? [] : this.toImportanceLeads(dealsWithImportance),
			conversionLeads:
				options?.includeDrillDown === false
					? []
					: this.toConversionLeads(leads, lostLeadIds),
		};
	}

	private toImportanceLeads(
		deals: readonly {
			importance: string;
			leadId: string;
			lead: { id: string; customer: { name: string } };
		}[],
	): AnalyticDrillDownLead[] {
		const byLead = new Map<string, AnalyticDrillDownLead>();

		for (const deal of deals) {
			const current = byLead.get(deal.leadId);
			const nextRank = IMPORTANCE_RANK[deal.importance] ?? 0;
			const currentRank = current?.importance
				? (IMPORTANCE_RANK[current.importance] ?? 0)
				: 0;

			if (!current || nextRank > currentRank) {
				byLead.set(deal.leadId, {
					id: deal.lead.id,
					label: deal.lead.customer.name,
					importance: deal.importance,
				});
			}
		}

		return [...byLead.values()]
			.sort((left, right) => {
				const leftRank = left.importance
					? (IMPORTANCE_RANK[left.importance] ?? 0)
					: 0;
				const rightRank = right.importance
					? (IMPORTANCE_RANK[right.importance] ?? 0)
					: 0;
				if (rightRank !== leftRank) return rightRank - leftRank;
				return left.label.localeCompare(right.label);
			})
			.slice(0, DRILL_DOWN_LIMIT);
	}

	private toConversionLeads(
		leads: readonly PrismaLeadRow[],
		lostLeadIds: ReadonlySet<string>,
	): AnalyticDrillDownLead[] {
		const outcomeRank: Record<NonNullable<AnalyticDrillDownLead['outcome']>, number> =
			{
				converted: 3,
				lost: 2,
				open: 1,
			};

		return leads
			.map((lead) => {
				const isConverted = lead.status === 'CONVERTED';
				const isLost = lostLeadIds.has(lead.id);
				const outcome: NonNullable<AnalyticDrillDownLead['outcome']> =
					isConverted ? 'converted' : isLost ? 'lost' : 'open';

				return {
					id: lead.id,
					label: lead.customer.name,
					outcome,
				};
			})
			.sort((left, right) => {
				const leftRank = left.outcome ? outcomeRank[left.outcome] : 0;
				const rightRank = right.outcome ? outcomeRank[right.outcome] : 0;
				if (rightRank !== leftRank) return rightRank - leftRank;
				return left.label.localeCompare(right.label);
			})
			.slice(0, DRILL_DOWN_LIMIT);
	}

	private incrementCounter(
		source: Map<
			string,
			{ readonly id: string; readonly name: string; counter: Counter }
		>,
		id: string,
		name: string,
		isConverted: boolean,
		isLost: boolean,
		dealCounts?: DealCountsByLead,
	): void {
		const entry = source.get(id) ?? { id, name, counter: emptyCounter() };
		entry.counter.totalLeads += 1;
		entry.counter.convertedLeads += isConverted ? 1 : 0;
		entry.counter.notConvertedLeads += isConverted ? 0 : 1;
		entry.counter.lostLeads += isLost ? 1 : 0;
		entry.counter.openDeals += dealCounts?.openDeals ?? 0;
		entry.counter.wonDeals += dealCounts?.wonDeals ?? 0;
		entry.counter.lostDeals += dealCounts?.lostDeals ?? 0;
		source.set(id, entry);
	}

	private buildLeadWhere(
		scope: AnalyticsScope,
		timeRange: AnalyticsTimeRange,
	): Prisma.LeadWhereInput {
		return {
			createdAt: {
				gte: timeRange.startAt,
				lt: timeRange.endExclusive,
			},
			...this.buildScopeWhere(scope),
		};
	}

	private buildScopeWhere(scope: AnalyticsScope): Prisma.LeadWhereInput {
		if (scope.kind === 'full') return {};

		if (scope.kind === 'attendant') {
			return { ownerUserId: scope.actorUserId };
		}

		if (scope.kind === 'manager') {
			return {
				OR: [
					{
						owner: {
							is: {
								OR: [
									{
										memberTeams: {
											some: { id: { in: [...scope.readTeamIds] } },
										},
									},
									{
										managedTeams: {
											some: { id: { in: [...scope.readTeamIds] } },
										},
									},
								],
							},
						},
					},
					{ ownerUserId: null, storeId: { in: [...scope.readStoreIds] } },
				],
			};
		}

		return { storeId: { in: [...scope.readStoreIds] } };
	}

	private toImportanceDistribution(
		groups: readonly { importance: string; _count: { _all: number } }[],
	): AnalyticDistributionItem[] {
		return groups
			.map((group) => ({
				key: group.importance,
				label: this.importanceLabel(group.importance),
				count: group._count._all,
			}))
			.sort((left, right) => {
				if (right.count !== left.count) return right.count - left.count;
				return left.label.localeCompare(right.label);
			});
	}

	private toFinalizationReasons(
		lostDeals: readonly { lossReason: string | null }[],
	): AnalyticDistributionItem[] {
		const counters = new Map<string, number>();
		for (const deal of lostDeals) {
			const key = deal.lossReason ?? 'OTHER';
			counters.set(key, (counters.get(key) ?? 0) + 1);
		}
		return [...counters.entries()]
			.map(([key, count]) => ({
				key,
				label: this.lossReasonLabel(key),
				count,
			}))
			.sort((left, right) => {
				if (right.count !== left.count) return right.count - left.count;
				return left.label.localeCompare(right.label);
			});
	}

	private emptyTrendBuckets(timeRange: AnalyticsTimeRange): Map<
		string,
		{
			totalLeads: number;
			convertedLeads: number;
			lostLeads: number;
			interactionLeadCount: number;
			interactionTotalHours: number;
		}
	> {
		const buckets = new Map<
			string,
			{
				totalLeads: number;
				convertedLeads: number;
				lostLeads: number;
				interactionLeadCount: number;
				interactionTotalHours: number;
			}
		>();
		for (
			let cursor = timeRange.startAt.getTime();
			cursor < timeRange.endExclusive.getTime();
			cursor += DAY_IN_MS
		) {
			buckets.set(toDateKey(new Date(cursor)), {
				totalLeads: 0,
				convertedLeads: 0,
				lostLeads: 0,
				interactionLeadCount: 0,
				interactionTotalHours: 0,
			});
		}
		return buckets;
	}

	private toTrendPoints(
		buckets: Map<
			string,
			{
				totalLeads: number;
				convertedLeads: number;
				lostLeads: number;
				interactionLeadCount: number;
				interactionTotalHours: number;
			}
		>,
	): AnalyticTrendPoint[] {
		return [...buckets.entries()].map(([date, bucket]) => ({
			date,
			totalLeads: bucket.totalLeads,
			convertedLeads: bucket.convertedLeads,
			lostLeads: bucket.lostLeads,
			conversionRate: toRate(
				bucket.convertedLeads,
				bucket.convertedLeads + bucket.lostLeads,
			),
			averageTimeToFirstInteractionHours:
				bucket.interactionLeadCount === 0
					? null
					: round2(bucket.interactionTotalHours / bucket.interactionLeadCount),
		}));
	}

	private importanceLabel(importance: string): string {
		switch (importance) {
			case 'HOT':
				return 'Quente';
			case 'WARM':
				return 'Morno';
			case 'COLD':
				return 'Frio';
			default:
				return importance;
		}
	}

	private lossReasonLabel(reason: string): string {
		switch (reason) {
			case 'NO_INTEREST':
				return 'Sem interesse';
			case 'PRICE_EXPECTATION':
				return 'Preço fora da expectativa';
			case 'BOUGHT_ELSEWHERE':
				return 'Comprou em outra loja';
			case 'NO_RESPONSE':
				return 'Não retornou contato';
			case 'VEHICLE_UNAVAILABLE':
				return 'Veículo indisponível';
			case 'OTHER':
				return 'Outros';
			default:
				return reason;
		}
	}

	private resolveFirstInteractionAt(input: {
		readonly lead: PrismaLeadRow;
		readonly firstDealAt: Date | null;
		readonly firstLeadEventAt: Date | null;
	}): Date | null {
		const candidates: Date[] = [];
		const { lead, firstDealAt, firstLeadEventAt } = input;

		if (
			firstLeadEventAt !== null &&
			firstLeadEventAt.getTime() >= lead.createdAt.getTime()
		) {
			candidates.push(firstLeadEventAt);
		}

		if (
			firstDealAt !== null &&
			firstDealAt.getTime() >= lead.createdAt.getTime()
		) {
			candidates.push(firstDealAt);
		}

		if (
			candidates.length === 0 &&
			lead.updatedAt.getTime() > lead.createdAt.getTime()
		) {
			candidates.push(lead.updatedAt);
		}

		if (candidates.length === 0) return null;
		return candidates.reduce((earliest, current) =>
			current.getTime() < earliest.getTime() ? current : earliest,
		);
	}
}

export { AnalyticDashboardPrismaRepository };
