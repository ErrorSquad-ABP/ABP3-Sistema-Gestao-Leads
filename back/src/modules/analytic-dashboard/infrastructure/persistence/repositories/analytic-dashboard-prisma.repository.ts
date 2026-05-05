import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type {
	AnalyticDashboardResult,
	AnalyticDistributionItem,
	AnalyticPerformanceItem,
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

const FIRST_INTERACTION_METHODOLOGY =
	'Aproximacao baseada no primeiro evento operacional registrado, na primeira negociacao criada ou, sem esses registros, em updatedAt do lead.';

type Counter = {
	totalLeads: number;
	convertedLeads: number;
	notConvertedLeads: number;
	openDeals: number;
	wonDeals: number;
	lostDeals: number;
};

function emptyCounter(): Counter {
	return {
		totalLeads: 0,
		convertedLeads: 0,
		notConvertedLeads: 0,
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
		.map((item) => ({
			id: item.id,
			name: item.name,
			totalLeads: item.counter.totalLeads,
			convertedLeads: item.counter.convertedLeads,
			notConvertedLeads: item.counter.notConvertedLeads,
			conversionRate: toRate(
				item.counter.convertedLeads,
				item.counter.totalLeads,
			),
			openDeals: item.counter.openDeals,
			wonDeals: item.counter.wonDeals,
			lostDeals: item.counter.lostDeals,
		}))
		.sort((left, right) => {
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

		if (group.status === 'OPEN') {
			counter.openDeals = group._count._all;
		}
		if (group.status === 'WON') {
			counter.wonDeals = group._count._all;
		}
		if (group.status === 'LOST') {
			counter.lostDeals = group._count._all;
		}

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

function emptyAnalyticsResult(): AnalyticDashboardResult {
	return {
		summary: {
			totalLeads: 0,
			convertedLeads: 0,
			notConvertedLeads: 0,
			conversionRate: 0,
		},
		byAttendant: [],
		byTeam: [],
		importanceDistribution: [],
		finalizationReasons: [],
		averageTimeToFirstInteraction: {
			hours: null,
			leadsWithInteraction: 0,
			isApproximate: true,
			methodology: FIRST_INTERACTION_METHODOLOGY,
		},
	};
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
		const leadWhere = this.buildLeadWhere(scope, timeRange);
		const dealWhere: Prisma.DealWhereInput = {
			lead: leadWhere,
		};

		const [
			totalLeads,
			convertedLeads,
			importanceGroups,
			finalizationGroups,
			dealStatusByLead,
			firstDealByLead,
			firstLeadEventByLead,
			leads,
		] = await Promise.all([
			this.prisma.lead.count({ where: leadWhere }),
			this.prisma.lead.count({
				where: {
					...leadWhere,
					status: 'CONVERTED',
				},
			}),
			this.prisma.deal.groupBy({
				by: ['importance'],
				_count: { _all: true },
				where: dealWhere,
			}),
			this.prisma.deal.groupBy({
				by: ['status'],
				_count: { _all: true },
				where: {
					...dealWhere,
					status: { in: ['WON', 'LOST'] },
				},
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
			// Team derivation still depends on owner/team/store relationships, so we keep
			// only the minimal lead projection needed for ranking and interaction timing.
			this.prisma.lead.findMany({
				where: leadWhere,
				select: {
					id: true,
					storeId: true,
					status: true,
					createdAt: true,
					updatedAt: true,
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
		]);

		if (totalLeads === 0) {
			return emptyAnalyticsResult();
		}

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
		const notConvertedLeads = totalLeads - convertedLeads;

		for (const lead of leads) {
			const isConverted = lead.status === 'CONVERTED';
			const ownerId = lead.owner?.id ?? '__unassigned__';
			const ownerName = lead.owner?.name ?? 'Sem responsavel';
			const attendantEntry = attendantCounters.get(ownerId) ?? {
				id: ownerId,
				name: ownerName,
				counter: emptyCounter(),
			};
			attendantEntry.counter.totalLeads += 1;
			attendantEntry.counter.convertedLeads += isConverted ? 1 : 0;
			attendantEntry.counter.notConvertedLeads += isConverted ? 0 : 1;
			const dealCounts = dealCountsByLead.get(lead.id);
			attendantEntry.counter.openDeals += dealCounts?.openDeals ?? 0;
			attendantEntry.counter.wonDeals += dealCounts?.wonDeals ?? 0;
			attendantEntry.counter.lostDeals += dealCounts?.lostDeals ?? 0;
			attendantCounters.set(ownerId, attendantEntry);

			const primaryTeam = resolvePrimaryTeam(lead, visibleTeamIds);
			const teamId = primaryTeam?.id ?? '__no_team__';
			const teamName = primaryTeam?.name ?? 'Sem equipe';
			const teamEntry = teamCounters.get(teamId) ?? {
				id: teamId,
				name: teamName,
				counter: emptyCounter(),
			};
			teamEntry.counter.totalLeads += 1;
			teamEntry.counter.convertedLeads += isConverted ? 1 : 0;
			teamEntry.counter.notConvertedLeads += isConverted ? 0 : 1;
			teamEntry.counter.openDeals += dealCounts?.openDeals ?? 0;
			teamEntry.counter.wonDeals += dealCounts?.wonDeals ?? 0;
			teamEntry.counter.lostDeals += dealCounts?.lostDeals ?? 0;
			teamCounters.set(teamId, teamEntry);

			const interactionAt = this.resolveFirstInteractionAt({
				lead,
				firstDealAt: firstDealAtByLead.get(lead.id) ?? null,
				firstLeadEventAt: firstLeadEventAtByLead.get(lead.id) ?? null,
			});
			if (interactionAt !== null) {
				interactionLeadCount += 1;
				interactionTotalHours +=
					(interactionAt.getTime() - lead.createdAt.getTime()) / 3_600_000;
			}
		}

		return {
			summary: {
				totalLeads,
				convertedLeads,
				notConvertedLeads,
				conversionRate: toRate(convertedLeads, totalLeads),
			},
			byAttendant: toPerformanceItems(attendantCounters, options?.top),
			byTeam: toPerformanceItems(teamCounters, options?.top),
			importanceDistribution: this.toImportanceDistribution(importanceGroups),
			finalizationReasons: this.toFinalizationReasons(finalizationGroups),
			averageTimeToFirstInteraction: {
				hours:
					interactionLeadCount === 0
						? null
						: round2(interactionTotalHours / interactionLeadCount),
				leadsWithInteraction: interactionLeadCount,
				isApproximate: true,
				methodology: FIRST_INTERACTION_METHODOLOGY,
			},
		};
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
		if (scope.kind === 'full') {
			return {};
		}

		if (scope.kind === 'attendant') {
			return {
				ownerUserId: scope.actorUserId,
			};
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
					{
						ownerUserId: null,
						storeId: { in: [...scope.readStoreIds] },
					},
				],
			};
		}

		return {
			storeId: { in: [...scope.readStoreIds] },
		};
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
				if (right.count !== left.count) {
					return right.count - left.count;
				}
				return left.label.localeCompare(right.label);
			});
	}

	private toFinalizationReasons(
		groups: readonly { status: string; _count: { _all: number } }[],
	): AnalyticDistributionItem[] {
		return groups
			.map((group) => ({
				key: group.status === 'WON' ? 'sale_completed' : 'closed_without_sale',
				label:
					group.status === 'WON' ? 'Venda concluida' : 'Encerrada sem venda',
				count: group._count._all,
			}))
			.sort((left, right) => {
				if (right.count !== left.count) {
					return right.count - left.count;
				}
				return left.label.localeCompare(right.label);
			});
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

		if (candidates.length === 0) {
			return null;
		}

		return candidates.reduce((earliest, current) =>
			current.getTime() < earliest.getTime() ? current : earliest,
		);
	}
}

export { AnalyticDashboardPrismaRepository };
