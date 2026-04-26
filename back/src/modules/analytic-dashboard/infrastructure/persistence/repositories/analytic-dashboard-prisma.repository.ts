import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type {
	AnalyticDashboardResult,
	AnalyticDistributionItem,
	AnalyticPerformanceItem,
	AnalyticsScope,
	AnalyticsTimeRange,
	IAnalyticDashboardRepository,
} from '../../../domain/repositories/analytic-dashboard.repository.js';

type PrismaLeadRow = Prisma.LeadGetPayload<{
	include: {
		owner: {
			select: {
				id: true;
				name: true;
				memberTeams: { select: { id: true; name: true; storeId: true } };
				managedTeams: { select: { id: true; name: true; storeId: true } };
			};
		};
		deals: {
			select: {
				id: true;
				importance: true;
				status: true;
				createdAt: true;
				closedAt: true;
			};
		};
	};
}>;

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
): AnalyticPerformanceItem[] {
	return [...source.values()]
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
}

function toDistributionItems(
	source: Map<
		string,
		{ readonly key: string; readonly label: string; count: number }
	>,
): AnalyticDistributionItem[] {
	return [...source.values()]
		.map((item) => ({ key: item.key, label: item.label, count: item.count }))
		.sort((left, right) => {
			if (right.count !== left.count) {
				return right.count - left.count;
			}
			return left.label.localeCompare(right.label);
		});
}

class AnalyticDashboardPrismaRepository
	implements IAnalyticDashboardRepository
{
	constructor(private readonly prisma: PrismaService) {}

	async getAnalyticDashboard(
		scope: AnalyticsScope,
		timeRange: AnalyticsTimeRange,
	): Promise<AnalyticDashboardResult> {
		const where: Prisma.LeadWhereInput = {
			createdAt: {
				gte: timeRange.startAt,
				lt: timeRange.endExclusive,
			},
			...this.buildScopeWhere(scope),
		};

		const leads = await this.prisma.lead.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			include: {
				owner: {
					select: {
						id: true,
						name: true,
						memberTeams: { select: { id: true, name: true, storeId: true } },
						managedTeams: { select: { id: true, name: true, storeId: true } },
					},
				},
				deals: {
					select: {
						id: true,
						importance: true,
						status: true,
						createdAt: true,
						closedAt: true,
					},
				},
			},
		});

		const attendantCounters = new Map<
			string,
			{ readonly id: string; readonly name: string; counter: Counter }
		>();
		const teamCounters = new Map<
			string,
			{ readonly id: string; readonly name: string; counter: Counter }
		>();
		const importanceCounters = new Map<
			string,
			{ readonly key: string; readonly label: string; count: number }
		>();
		const finalizationCounters = new Map<
			string,
			{ readonly key: string; readonly label: string; count: number }
		>();

		const visibleTeamIds =
			scope.kind === 'manager' ? new Set(scope.readTeamIds) : undefined;

		let totalLeads = 0;
		let convertedLeads = 0;
		let notConvertedLeads = 0;
		let interactionLeadCount = 0;
		let interactionTotalHours = 0;

		for (const lead of leads) {
			totalLeads += 1;

			const isConverted = lead.status === 'CONVERTED';
			if (isConverted) {
				convertedLeads += 1;
			} else {
				notConvertedLeads += 1;
			}

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

			for (const deal of lead.deals) {
				attendantEntry.counter.openDeals += deal.status === 'OPEN' ? 1 : 0;
				attendantEntry.counter.wonDeals += deal.status === 'WON' ? 1 : 0;
				attendantEntry.counter.lostDeals += deal.status === 'LOST' ? 1 : 0;

				const importanceKey = deal.importance;
				const importanceItem = importanceCounters.get(importanceKey) ?? {
					key: importanceKey,
					label: this.importanceLabel(importanceKey),
					count: 0,
				};
				importanceItem.count += 1;
				importanceCounters.set(importanceKey, importanceItem);

				if (deal.status === 'WON' || deal.status === 'LOST') {
					const reasonKey =
						deal.status === 'WON' ? 'sale_completed' : 'closed_without_sale';
					const reasonItem = finalizationCounters.get(reasonKey) ?? {
						key: reasonKey,
						label:
							deal.status === 'WON' ? 'Venda concluida' : 'Encerrada sem venda',
						count: 0,
					};
					reasonItem.count += 1;
					finalizationCounters.set(reasonKey, reasonItem);
				}
			}
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
			for (const deal of lead.deals) {
				teamEntry.counter.openDeals += deal.status === 'OPEN' ? 1 : 0;
				teamEntry.counter.wonDeals += deal.status === 'WON' ? 1 : 0;
				teamEntry.counter.lostDeals += deal.status === 'LOST' ? 1 : 0;
			}
			teamCounters.set(teamId, teamEntry);

			const interactionAt = this.resolveFirstInteractionAt(lead);
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
			byAttendant: toPerformanceItems(attendantCounters),
			byTeam: toPerformanceItems(teamCounters),
			importanceDistribution: toDistributionItems(importanceCounters),
			finalizationReasons: toDistributionItems(finalizationCounters),
			averageTimeToFirstInteraction: {
				hours:
					interactionLeadCount === 0
						? null
						: round2(interactionTotalHours / interactionLeadCount),
				leadsWithInteraction: interactionLeadCount,
			},
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

	private resolveFirstInteractionAt(lead: PrismaLeadRow): Date | null {
		const candidates: Date[] = [];

		if (lead.updatedAt.getTime() > lead.createdAt.getTime()) {
			candidates.push(lead.updatedAt);
		}

		for (const deal of lead.deals) {
			if (deal.createdAt.getTime() >= lead.createdAt.getTime()) {
				candidates.push(deal.createdAt);
			}
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
