import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import { computeTotalPages } from '../../../domain/types/lead-list-page.js';
import type {
	ILeadRepository,
	LeadListFilters,
} from '../../../domain/repositories/lead.repository.js';
import { buildListTeamLeadsWhere } from '../../queries/list-team-leads.query.js';
import { LeadMapper } from '../mappers/lead.mapper.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

function withoutOpenDealWhere(filters?: LeadListFilters): Prisma.LeadWhereInput {
	return filters?.withoutOpenDeal
		? { deals: { none: { status: 'OPEN' } } }
		: {};
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

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}
}

export { LeadPrismaRepository };
