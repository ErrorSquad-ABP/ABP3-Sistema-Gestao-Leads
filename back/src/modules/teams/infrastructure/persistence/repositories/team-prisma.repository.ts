import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { ITeamRepository } from '../../../domain/repositories/team.repository.js';
import { TeamMapper } from '../mappers/team.mapper.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

const teamInclude = {
	members: { select: { id: true } },
} as const;

class TeamPrismaRepository implements ITeamRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	async create(team: Parameters<ITeamRepository['create']>[0]) {
		const record = TeamMapper.toRecord(team);
		const created = await this.client.team.create({
			data: {
				id: record.id,
				name: record.name,
				storeId: record.storeId,
				managerId: record.managerId,
				...(record.memberUserIds.length > 0
					? {
							members: {
								connect: record.memberUserIds.map((id) => ({ id })),
							},
						}
					: {}),
			},
			include: teamInclude,
		});
		return TeamMapper.toDomain(created);
	}

	async update(team: Parameters<ITeamRepository['update']>[0]) {
		const record = TeamMapper.toRecord(team);
		const updated = await this.client.team.update({
			data: {
				name: record.name,
				storeId: record.storeId,
				managerId: record.managerId,
				members: {
					set: record.memberUserIds.map((id) => ({ id })),
				},
			},
			where: { id: record.id },
			include: teamInclude,
		});
		return TeamMapper.toDomain(updated);
	}

	async delete(id: Parameters<ITeamRepository['delete']>[0]): Promise<void> {
		await this.client.team.delete({ where: { id: id.value } });
	}

	async findById(id: Parameters<ITeamRepository['findById']>[0]) {
		const team = await this.client.team.findUnique({
			where: { id: id.value },
			include: teamInclude,
		});
		return team ? TeamMapper.toDomain(team) : null;
	}

	async list() {
		const teams = await this.client.team.findMany({
			orderBy: { createdAt: 'desc' },
			include: teamInclude,
		});
		return teams.map((team) => TeamMapper.toDomain(team));
	}

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}
}

export { TeamPrismaRepository };
