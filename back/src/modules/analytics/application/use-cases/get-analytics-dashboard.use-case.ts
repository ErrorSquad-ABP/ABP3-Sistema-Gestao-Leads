import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: Nest DI
import { TemporalFilterPolicyService } from '../../../../shared/application/services/temporal-filter-policy.service.js';
// biome-ignore lint/style/useImportType: Nest DI
import { AnalyticsDashboardPrismaQuery } from '../../infrastructure/queries/analytics-dashboard.prisma-query.js';
import type {
	AnalyticsDashboardDto,
	AnalyticsDistributionItemDto,
	AnalyticsLeadRecord,
	AnalyticsPerformanceItemDto,
	GetAnalyticsDashboardInputDto,
} from '../dto/analytics-dashboard.dto.js';

type AggregateBucket = {
	entityId: string | null;
	entityName: string;
	teamId: string | null;
	teamName: string | null;
	totalLeads: number;
	convertedLeads: number;
};

function roundToTwoDecimals(value: number): number {
	return Number(value.toFixed(2));
}

function calculateConversionRate(
	convertedLeads: number,
	totalLeads: number,
): number {
	if (totalLeads <= 0) {
		return 0;
	}

	return roundToTwoDecimals((convertedLeads / totalLeads) * 100);
}

function isConvertedStatus(status: string): boolean {
	return status === 'CONVERTED';
}

function toPerformanceItems(
	buckets: Iterable<AggregateBucket>,
): AnalyticsPerformanceItemDto[] {
	return [...buckets]
		.map((bucket) => ({
			entityId: bucket.entityId,
			entityName: bucket.entityName,
			teamId: bucket.teamId,
			teamName: bucket.teamName,
			totalLeads: bucket.totalLeads,
			convertedLeads: bucket.convertedLeads,
			nonConvertedLeads: bucket.totalLeads - bucket.convertedLeads,
			conversionRate: calculateConversionRate(
				bucket.convertedLeads,
				bucket.totalLeads,
			),
		}))
		.sort((left, right) => {
			if (right.totalLeads !== left.totalLeads) {
				return right.totalLeads - left.totalLeads;
			}

			return left.entityName.localeCompare(right.entityName, 'pt-BR');
		});
}

function averageTimeToFirstDealHours(leads: readonly AnalyticsLeadRecord[]) {
	const differencesInHours = leads
		.filter((lead) => lead.firstDealCreatedAt !== null)
		.map((lead) => {
			const diffMs =
				(lead.firstDealCreatedAt?.getTime() ?? 0) -
				lead.leadCreatedAt.getTime();
			return diffMs >= 0 ? diffMs / (1000 * 60 * 60) : null;
		})
		.filter((value): value is number => value !== null);

	if (differencesInHours.length === 0) {
		return null;
	}

	const total = differencesInHours.reduce((sum, value) => sum + value, 0);
	return roundToTwoDecimals(total / differencesInHours.length);
}

@Injectable()
class GetAnalyticsDashboardUseCase {
	constructor(
		private readonly temporalFilterPolicyService: TemporalFilterPolicyService,
		private readonly analyticsDashboardPrismaQuery: AnalyticsDashboardPrismaQuery,
	) {}

	async execute(
		input: GetAnalyticsDashboardInputDto,
	): Promise<AnalyticsDashboardDto> {
		const period = this.temporalFilterPolicyService.resolveForRole(
			input.filter,
			input.role,
		);
		const leads =
			await this.analyticsDashboardPrismaQuery.findDashboardRecords(period);

		const totalLeads = leads.length;
		const convertedLeads = leads.filter((lead) =>
			isConvertedStatus(lead.leadStatus),
		).length;
		const nonConvertedLeads = totalLeads - convertedLeads;

		const attendantBuckets = new Map<string, AggregateBucket>();
		const teamBuckets = new Map<string, AggregateBucket>();

		for (const lead of leads) {
			const converted = isConvertedStatus(lead.leadStatus) ? 1 : 0;

			const attendantKey = lead.ownerUserId ?? 'unassigned';
			const attendantBucket = attendantBuckets.get(attendantKey) ?? {
				entityId: lead.ownerUserId,
				entityName: lead.ownerName ?? 'Sem responsavel',
				teamId: lead.teamId,
				teamName: lead.teamName,
				totalLeads: 0,
				convertedLeads: 0,
			};

			attendantBucket.totalLeads += 1;
			attendantBucket.convertedLeads += converted;
			attendantBuckets.set(attendantKey, attendantBucket);

			const teamKey = lead.teamId ?? 'unassigned';
			const teamBucket = teamBuckets.get(teamKey) ?? {
				entityId: lead.teamId,
				entityName: lead.teamName ?? 'Sem equipe',
				teamId: lead.teamId,
				teamName: lead.teamName,
				totalLeads: 0,
				convertedLeads: 0,
			};

			teamBucket.totalLeads += 1;
			teamBucket.convertedLeads += converted;
			teamBuckets.set(teamKey, teamBucket);
		}

		const emptyDistribution: readonly AnalyticsDistributionItemDto[] = [];

		return {
			period,
			summary: {
				totalLeads,
				convertedLeads,
				nonConvertedLeads,
				conversionRate: calculateConversionRate(convertedLeads, totalLeads),
				averageTimeToFirstDealHours: averageTimeToFirstDealHours(leads),
			},
			convertedVsNonConverted: {
				converted: convertedLeads,
				nonConverted: nonConvertedLeads,
			},
			byAttendant: toPerformanceItems(attendantBuckets.values()),
			byTeam: toPerformanceItems(teamBuckets.values()),
			// Estes dois blocos ficam com arrays vazios por enquanto porque o schema
			// atual ainda nao persiste importance e closeReason no Deal.
			byImportance: emptyDistribution,
			closeReasons: emptyDistribution,
		};
	}
}

export { GetAnalyticsDashboardUseCase };
