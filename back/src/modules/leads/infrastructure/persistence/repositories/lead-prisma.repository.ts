import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { ILeadRepository } from '../../../domain/repositories/lead.repository.js';
import { LeadMapper } from '../mappers/lead.mapper.js';
import { buildListTeamLeadsWhere } from '../../queries/list-team-leads.query.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

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

	async listByOwner(userId: Parameters<ILeadRepository['listByOwner']>[0]) {
		const leads = await this.client.lead.findMany({
			orderBy: { createdAt: 'desc' },
			where: { ownerUserId: userId.value },
		});
		return leads.map((lead) => LeadMapper.toDomain(lead));
	}

	async listByTeam(teamId: Parameters<ILeadRepository['listByTeam']>[0]) {
		const leads = await this.client.lead.findMany({
			orderBy: { createdAt: 'desc' },
			where: buildListTeamLeadsWhere(teamId.value),
		});
		return leads.map((lead) => LeadMapper.toDomain(lead));
	}

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}
}

export { LeadPrismaRepository };
