import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { LeadSource as PrismaLeadSource } from '../../../../../generated/prisma/enums.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import { DEAL_IMPORTANCES } from '../../../../../shared/domain/enums/deal-importance.enum.js';
import { LEAD_STATUSES } from '../../../../../shared/domain/enums/lead-status.enum.js';
import { ALLOWED_LEAD_SOURCES } from '../../../../../shared/domain/value-objects/lead-source.value-object.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type {
	DashboardDistributionItem,
	DashboardStoreDistributionItem,
	IOperationalDashboardRepository,
	OperationalDashboardAggregate,
	OperationalDashboardScope,
	OperationalDashboardTrendPoint,
} from '../../../domain/repositories/operational-dashboard.repository.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

const PRISMA_STATUS_TO_DOMAIN_STATUS: Record<string, string> = {
	CONTACTED: 'CONTACTED',
	CONVERTED: 'CONVERTED',
	LOST: 'DISQUALIFIED',
	NEGOTIATING: 'QUALIFIED',
	NEW: 'NEW',
	QUALIFIED: 'QUALIFIED',
};

const PRISMA_SOURCE_TO_DOMAIN_SOURCE: Record<PrismaLeadSource, string> = {
	FACEBOOK: 'facebook',
	INDICATION: 'indication',
	INSTAGRAM: 'instagram',
	MERCADO_LIVRE: 'mercado-livre',
	OTHER: 'other',
	PHONE: 'phone-call',
	WALK_IN: 'store-visit',
	WEBSITE: 'digital-form',
	WHATSAPP: 'whatsapp',
};

const ACTIVE_LEAD_STATUSES = new Set(['CONTACTED', 'NEW', 'QUALIFIED']);

class OperationalDashboardPrismaRepository
	implements IOperationalDashboardRepository
{
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	async getOperationalAggregate(input: {
		readonly period: { readonly startDate: Date; readonly endDate: Date };
		readonly scope: OperationalDashboardScope;
	}): Promise<OperationalDashboardAggregate> {
		const whereLead = this.buildLeadWhere(input.period, input.scope);
		const [totalLeads, statusRows, sourceRows, storeRows, importanceRows] =
			await Promise.all([
				this.client.lead.count({ where: whereLead }),
				this.client.lead.groupBy({
					by: ['status'],
					where: whereLead,
					_count: { _all: true },
				}),
				this.client.lead.groupBy({
					by: ['source'],
					where: whereLead,
					_count: { _all: true },
				}),
				this.client.lead.groupBy({
					by: ['storeId'],
					where: whereLead,
					_count: { _all: true },
				}),
				this.client.deal.groupBy({
					by: ['importance'],
					where: {
						status: 'OPEN',
						lead: { is: whereLead },
					},
					_count: { _all: true },
				}),
			]);

		const storesById = await this.resolveStoreNames(
			storeRows.map((r) => r.storeId),
		);
		const byStatus = this.fillMissingBuckets(
			LEAD_STATUSES,
			statusRows.map((row) => ({
				key: PRISMA_STATUS_TO_DOMAIN_STATUS[row.status] ?? row.status,
				count: row._count._all,
			})),
		);
		const bySource = this.fillMissingBuckets(
			ALLOWED_LEAD_SOURCES,
			sourceRows.map((row) => ({
				key: PRISMA_SOURCE_TO_DOMAIN_SOURCE[row.source] ?? 'other',
				count: row._count._all,
			})),
		);
		const byImportance = this.fillMissingBuckets(
			DEAL_IMPORTANCES,
			importanceRows.map((row) => ({
				key: row.importance,
				count: row._count._all,
			})),
		);
		const byStore: DashboardStoreDistributionItem[] = storeRows
			.map((row) => ({
				storeId: row.storeId,
				storeName: storesById.get(row.storeId) ?? 'Loja sem nome',
				count: row._count._all,
			}))
			.sort((a, b) => a.storeName.localeCompare(b.storeName, 'pt-BR'));

		return {
			totalLeads,
			totalLeadsWithOpenDeal: byImportance.reduce(
				(total, item) => total + item.count,
				0,
			),
			byStatus,
			bySource,
			byStore,
			byImportance,
		};
	}

	async getOperationalTrend(input: {
		readonly period: { readonly startDate: Date; readonly endDate: Date };
		readonly scope: OperationalDashboardScope;
	}): Promise<OperationalDashboardTrendPoint[]> {
		const rows = await this.client.lead.findMany({
			where: this.buildLeadWhere(input.period, input.scope),
			select: {
				createdAt: true,
				status: true,
			},
			orderBy: { createdAt: 'asc' },
		});
		const dayBuckets = new Map<
			string,
			{
				totalLeads: number;
				activeLeads: number;
				convertedLeads: number;
			}
		>();

		for (const row of rows) {
			const date = row.createdAt.toISOString().slice(0, 10);
			const bucket = dayBuckets.get(date) ?? {
				activeLeads: 0,
				convertedLeads: 0,
				totalLeads: 0,
			};
			const status = PRISMA_STATUS_TO_DOMAIN_STATUS[row.status] ?? row.status;
			bucket.totalLeads += 1;
			if (ACTIVE_LEAD_STATUSES.has(status)) {
				bucket.activeLeads += 1;
			}
			if (status === 'CONVERTED') {
				bucket.convertedLeads += 1;
			}
			dayBuckets.set(date, bucket);
		}

		const points: OperationalDashboardTrendPoint[] = [];
		const current = new Date(
			Date.UTC(
				input.period.startDate.getUTCFullYear(),
				input.period.startDate.getUTCMonth(),
				input.period.startDate.getUTCDate(),
			),
		);
		const end = new Date(
			Date.UTC(
				input.period.endDate.getUTCFullYear(),
				input.period.endDate.getUTCMonth(),
				input.period.endDate.getUTCDate(),
			),
		);
		while (current < end) {
			const date = current.toISOString().slice(0, 10);
			const bucket = dayBuckets.get(date);
			points.push({
				date,
				activeLeads: bucket?.activeLeads ?? 0,
				convertedLeads: bucket?.convertedLeads ?? 0,
				totalLeads: bucket?.totalLeads ?? 0,
			});
			current.setUTCDate(current.getUTCDate() + 1);
		}

		return points;
	}

	private async resolveStoreNames(
		storeIds: readonly string[],
	): Promise<Map<string, string>> {
		if (storeIds.length === 0) {
			return new Map();
		}
		const rows = await this.client.store.findMany({
			where: { id: { in: [...new Set(storeIds)] } },
			select: { id: true, name: true },
		});
		return new Map(rows.map((row) => [row.id, row.name]));
	}

	private fillMissingBuckets(
		keys: readonly string[],
		raw: readonly DashboardDistributionItem[],
	): DashboardDistributionItem[] {
		const counts = new Map<string, number>();
		for (const item of raw) {
			counts.set(item.key, (counts.get(item.key) ?? 0) + item.count);
		}

		return keys.map((key) => ({
			key,
			count: counts.get(key) ?? 0,
		}));
	}

	private buildLeadWhere(
		period: { readonly startDate: Date; readonly endDate: Date },
		scope: OperationalDashboardScope,
	): Prisma.LeadWhereInput {
		return {
			createdAt: {
				gte: period.startDate,
				lt: period.endDate,
			},
			storeId: scope.storeIds ? { in: [...scope.storeIds] } : undefined,
			ownerUserId: scope.ownerUserId,
		};
	}

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}
}

export { OperationalDashboardPrismaRepository };
