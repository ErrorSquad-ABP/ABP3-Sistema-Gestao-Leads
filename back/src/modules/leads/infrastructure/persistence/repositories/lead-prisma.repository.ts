import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import { computeTotalPages } from '../../../domain/types/lead-list-page.js';
import type {
	ILeadRepository,
	LeadCatalogBreakdownItem,
	LeadCatalogFilters,
	LeadCatalogItem,
	LeadListFilters,
} from '../../../domain/repositories/lead.repository.js';
import { buildListTeamLeadsWhere } from '../../queries/list-team-leads.query.js';
import { LeadMapper } from '../mappers/lead.mapper.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;
type LeadCatalogRow = Prisma.LeadGetPayload<{
	include: {
		customer: {
			select: {
				id: true;
				name: true;
				email: true;
				phone: true;
				cpf: true;
			};
		};
		store: { select: { id: true; name: true } };
		owner: { select: { id: true; name: true; email: true } };
		deals: true;
		events: true;
	};
}>;

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

function withoutOpenDealWhere(
	filters?: LeadListFilters,
): Prisma.LeadWhereInput {
	return filters?.withoutOpenDeal
		? { deals: { none: { status: 'OPEN' } } }
		: {};
}

function normalizeSearch(value: string): string {
	return value.trim().toLowerCase();
}

function leadMatchesSearch(row: LeadCatalogRow, search: string): boolean {
	if (!search) {
		return true;
	}
	return [
		row.customer.name,
		row.customer.email ?? '',
		row.customer.phone ?? '',
		row.customer.cpf ?? '',
		row.id,
		row.vehicleInterestText ?? '',
	]
		.join(' ')
		.toLowerCase()
		.includes(search);
}

function catalogScopeWhere(
	scope: LeadCatalogFilters['scope'],
): Prisma.LeadWhereInput {
	if (scope.kind === 'all') {
		return {};
	}
	if (scope.kind === 'owner') {
		return { ownerUserId: scope.ownerUserId.value };
	}
	if (scope.teamIds.length === 0) {
		return { id: { in: [] } };
	}
	return {
		owner: {
			is: {
				memberTeams: {
					some: { id: { in: [...scope.teamIds] } },
				},
			},
		},
	};
}

function getLastActivity(row: LeadCatalogRow): {
	readonly at: Date | null;
	readonly label: string;
} {
	let lastActivityAt: Date | null = row.updatedAt;
	let label = 'Cadastro';

	for (const event of row.events) {
		if (event.createdAt > (lastActivityAt ?? new Date(0))) {
			lastActivityAt = event.createdAt;
			label = event.title || 'Interação registrada';
		}
	}

	for (const deal of row.deals) {
		if (deal.updatedAt > (lastActivityAt ?? new Date(0))) {
			lastActivityAt = deal.updatedAt;
			label =
				deal.status === 'WON'
					? 'Negociação ganha'
					: deal.status === 'LOST'
						? 'Negociação perdida'
						: 'Proposta enviada';
		}
	}

	return { at: lastActivityAt, label };
}

function hasInteraction(row: LeadCatalogRow): boolean {
	return row.status !== 'NEW' || row.events.length > 0 || row.deals.length > 0;
}

function matchesActivityDate(
	item: LeadCatalogItem,
	filters: LeadCatalogFilters,
): boolean {
	const activityTime = item.lastActivityAt?.getTime();
	if (activityTime === undefined) {
		return !(filters.activityStartDate || filters.activityEndDate);
	}
	if (
		filters.activityStartDate &&
		activityTime < filters.activityStartDate.getTime()
	) {
		return false;
	}
	if (
		filters.activityEndDate &&
		activityTime > filters.activityEndDate.getTime()
	) {
		return false;
	}
	return true;
}

function sortBreakdown(
	items: LeadCatalogBreakdownItem[],
): LeadCatalogBreakdownItem[] {
	return [...items].sort((left, right) => {
		if (right.count !== left.count) {
			return right.count - left.count;
		}
		return left.label.localeCompare(right.label, 'pt-BR');
	});
}

class LeadPrismaRepository implements ILeadRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	async create(lead: Parameters<ILeadRepository['create']>[0]) {
		const record = LeadMapper.toRecord(lead);
		const created = await this.client.lead.create({
			data: {
				id: record.id,
				customerId: record.customerId,
				ownerUserId: record.ownerUserId,
				vehicleInterestText: record.vehicleInterestText,
				source: record.source,
				status: record.status,
				storeId: record.storeId,
			},
		});
		return LeadMapper.toDomain(created);
	}

	async update(lead: Parameters<ILeadRepository['update']>[0]) {
		const record = LeadMapper.toRecord(lead);
		const updated = await this.client.lead.update({
			data: {
				customerId: record.customerId,
				ownerUserId: record.ownerUserId,
				vehicleInterestText: record.vehicleInterestText,
				source: record.source,
				status: record.status,
				storeId: record.storeId,
			},
			where: { id: record.id },
		});
		return LeadMapper.toDomain(updated);
	}

	async delete(id: Parameters<ILeadRepository['delete']>[0]): Promise<void> {
		await this.client.lead.delete({ where: { id: id.value } });
	}

	async findById(id: Parameters<ILeadRepository['findById']>[0]) {
		const lead = await this.client.lead.findUnique({ where: { id: id.value } });
		return lead ? LeadMapper.toDomain(lead) : null;
	}

	async listByOwner(
		userId: Parameters<ILeadRepository['listByOwner']>[0],
		pagination: Parameters<ILeadRepository['listByOwner']>[1],
		filters?: LeadListFilters,
	) {
		const where: Prisma.LeadWhereInput = {
			ownerUserId: userId.value,
			...withoutOpenDealWhere(filters),
		};
		const skip = (pagination.page - 1) * pagination.limit;
		const [rows, total] = await Promise.all([
			this.client.lead.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip,
				take: pagination.limit,
			}),
			this.client.lead.count({ where }),
		]);
		return {
			items: rows.map((lead) => LeadMapper.toDomain(lead)),
			page: pagination.page,
			limit: pagination.limit,
			total,
			totalPages: computeTotalPages(total, pagination.limit),
		};
	}

	async listByTeam(
		teamId: Parameters<ILeadRepository['listByTeam']>[0],
		pagination: Parameters<ILeadRepository['listByTeam']>[1],
		filters?: LeadListFilters,
	) {
		const where = {
			...buildListTeamLeadsWhere(teamId.value),
			...withoutOpenDealWhere(filters),
		};
		const skip = (pagination.page - 1) * pagination.limit;
		const [rows, total] = await Promise.all([
			this.client.lead.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip,
				take: pagination.limit,
			}),
			this.client.lead.count({ where }),
		]);
		return {
			items: rows.map((lead) => LeadMapper.toDomain(lead)),
			page: pagination.page,
			limit: pagination.limit,
			total,
			totalPages: computeTotalPages(total, pagination.limit),
		};
	}

	async listAll(
		pagination: Parameters<ILeadRepository['listAll']>[0],
		filters?: LeadListFilters,
	) {
		const where = withoutOpenDealWhere(filters);
		const skip = (pagination.page - 1) * pagination.limit;
		const [rows, total] = await Promise.all([
			this.client.lead.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip,
				take: pagination.limit,
			}),
			this.client.lead.count({ where }),
		]);
		return {
			items: rows.map((lead) => LeadMapper.toDomain(lead)),
			page: pagination.page,
			limit: pagination.limit,
			total,
			totalPages: computeTotalPages(total, pagination.limit),
		};
	}

	async listByReadableTeams(
		teamIds: Parameters<ILeadRepository['listByReadableTeams']>[0],
		pagination: Parameters<ILeadRepository['listByReadableTeams']>[1],
		filters?: LeadListFilters,
	) {
		if (teamIds.length === 0) {
			return {
				items: [],
				page: pagination.page,
				limit: pagination.limit,
				total: 0,
				totalPages: 0,
			};
		}
		const where: Prisma.LeadWhereInput = {
			...withoutOpenDealWhere(filters),
			owner: {
				is: {
					memberTeams: {
						some: { id: { in: [...teamIds] } },
					},
				},
			},
		};
		const skip = (pagination.page - 1) * pagination.limit;
		const [rows, total] = await Promise.all([
			this.client.lead.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip,
				take: pagination.limit,
			}),
			this.client.lead.count({ where }),
		]);
		return {
			items: rows.map((lead) => LeadMapper.toDomain(lead)),
			page: pagination.page,
			limit: pagination.limit,
			total,
			totalPages: computeTotalPages(total, pagination.limit),
		};
	}

	async listCatalog(
		filters: Parameters<ILeadRepository['listCatalog']>[0],
		pagination: Parameters<ILeadRepository['listCatalog']>[1],
	) {
		const where: Prisma.LeadWhereInput = {
			...catalogScopeWhere(filters.scope),
			...(filters.status ? { status: filters.status } : {}),
			...(filters.source ? { source: filters.source } : {}),
			...(filters.storeId ? { storeId: filters.storeId.value } : {}),
			...(filters.ownerUserId
				? { ownerUserId: filters.ownerUserId.value }
				: {}),
		};

		const rows = await this.client.lead.findMany({
			where,
			include: {
				customer: {
					select: {
						id: true,
						name: true,
						email: true,
						phone: true,
						cpf: true,
					},
				},
				store: { select: { id: true, name: true } },
				owner: { select: { id: true, name: true, email: true } },
				deals: true,
				events: true,
			},
			orderBy: { createdAt: 'desc' },
		});

		const search = normalizeSearch(filters.search ?? '');
		const enriched = rows
			.filter((row) => leadMatchesSearch(row, search))
			.map((row): LeadCatalogItem => {
				const lastActivity = getLastActivity(row);
				return {
					lead: LeadMapper.toDomain(row),
					customer: row.customer,
					store: row.store,
					owner: row.owner,
					lastActivityAt: lastActivity.at,
					lastActivityLabel: lastActivity.label,
					openDealsCount: row.deals.filter((deal) => deal.status === 'OPEN')
						.length,
					totalDealsCount: row.deals.length,
					hasInteraction: hasInteraction(row),
				};
			})
			.filter((item) => matchesActivityDate(item, filters));

		const sorted = [...enriched].sort((left, right) => {
			switch (filters.sort) {
				case 'source':
					return (
						left.lead.source.value.localeCompare(
							right.lead.source.value,
							'pt-BR',
						) ||
						(right.lastActivityAt?.getTime() ?? 0) -
							(left.lastActivityAt?.getTime() ?? 0)
					);
				case 'status':
					return (
						left.lead.status.localeCompare(right.lead.status, 'pt-BR') ||
						(right.lastActivityAt?.getTime() ?? 0) -
							(left.lastActivityAt?.getTime() ?? 0)
					);
				default:
					return (
						(right.lastActivityAt?.getTime() ?? 0) -
							(left.lastActivityAt?.getTime() ?? 0) ||
						left.customer.name.localeCompare(right.customer.name, 'pt-BR')
					);
			}
		});

		const originCounts = new Map<string, number>();
		for (const item of enriched) {
			const key = item.lead.source.value;
			originCounts.set(key, (originCounts.get(key) ?? 0) + 1);
		}

		const total = sorted.length;
		const start = (pagination.page - 1) * pagination.limit;
		const pageItems = sorted.slice(start, start + pagination.limit);
		const staleLimit = Date.now() - SEVEN_DAYS_IN_MS;
		const converted = enriched.filter(
			(item) => item.lead.status === 'CONVERTED',
		).length;
		const openDeals = enriched.filter((item) => item.openDealsCount > 0).length;

		return {
			items: pageItems,
			summary: {
				total: enriched.length,
				withInteraction: enriched.filter((item) => item.hasInteraction).length,
				converted,
				staleNoContact: enriched.filter((item) => {
					if (
						item.lead.status === 'CONVERTED' ||
						item.lead.status === 'DISQUALIFIED'
					) {
						return false;
					}
					return (item.lastActivityAt?.getTime() ?? 0) < staleLimit;
				}).length,
				conversionRate:
					enriched.length > 0
						? Math.round((converted / enriched.length) * 100)
						: 0,
			},
			funnel: {
				totalLeads: enriched.length,
				withInteraction: enriched.filter((item) => item.hasInteraction).length,
				openDeals,
				converted,
			},
			origins: sortBreakdown(
				Array.from(originCounts, ([label, count]) => ({ label, count })),
			).slice(0, 5),
			page: pagination.page,
			limit: pagination.limit,
			total,
			totalPages: computeTotalPages(total, pagination.limit),
		};
	}

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}
}

export { LeadPrismaRepository };
