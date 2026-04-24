import { Injectable } from '@nestjs/common';

import type { ResolvedTemporalFilterDto } from '../../../../shared/application/dto/temporal-filter.dto.js';
// biome-ignore lint/style/useImportType: Nest DI
import { PrismaService } from '../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { AnalyticsLeadRecord } from '../../application/dto/analytics-dashboard.dto.js';

function startOfDayUtc(dateOnly: string): Date {
	return new Date(`${dateOnly}T00:00:00.000Z`);
}

function nextDayUtc(dateOnly: string): Date {
	const day = startOfDayUtc(dateOnly);
	day.setUTCDate(day.getUTCDate() + 1);
	return day;
}

@Injectable()
class AnalyticsDashboardPrismaQuery {
	constructor(private readonly prisma: PrismaService) {}

	async findDashboardRecords(
		filter: ResolvedTemporalFilterDto,
	): Promise<AnalyticsLeadRecord[]> {
		const leads = await this.prisma.lead.findMany({
			where: {
				createdAt: {
					gte: startOfDayUtc(filter.startDate),
					lt: nextDayUtc(filter.endDate),
				},
			},
			select: {
				id: true,
				status: true,
				createdAt: true,
				owner: {
					select: {
						id: true,
						name: true,
						team: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
				deals: {
					select: {
						createdAt: true,
					},
					orderBy: {
						createdAt: 'asc',
					},
					take: 1,
				},
			},
		});

		return leads.map((lead) => ({
			leadId: lead.id,
			leadStatus: lead.status,
			leadCreatedAt: lead.createdAt,
			ownerUserId: lead.owner?.id ?? null,
			ownerName: lead.owner?.name ?? null,
			teamId: lead.owner?.team?.id ?? null,
			teamName: lead.owner?.team?.name ?? null,
			firstDealCreatedAt: lead.deals[0]?.createdAt ?? null,
		}));
	}
}

export { AnalyticsDashboardPrismaQuery };
