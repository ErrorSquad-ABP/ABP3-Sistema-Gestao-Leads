import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../../shared/domain/value-objects/name.value-object.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import { Team } from '../../../domain/entities/team.entity.js';
import type { ITeamRepository } from '../../../domain/repositories/team.repository.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;
type TeamRecord = {
	readonly id: string;
	readonly name: string;
};

class TeamPrismaRepository implements ITeamRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	async create(team: Team): Promise<Team> {
		const created = await this.client.team.create({
			data: {
				id: team.id.value,
				name: team.name.value,
			},
		});
		return this.toDomain(created);
	}

	async update(team: Team): Promise<Team> {
		const updated = await this.client.team.update({
			data: { name: team.name.value },
			where: { id: team.id.value },
		});
		return this.toDomain(updated);
	}

	async delete(id: Parameters<ITeamRepository['delete']>[0]): Promise<void> {
		await this.client.team.delete({ where: { id: id.value } });
	}

	async findById(
		id: Parameters<ITeamRepository['findById']>[0],
	): Promise<Team | null> {
		const row = await this.client.team.findUnique({
			where: { id: id.value },
		});
		return row ? this.toDomain(row) : null;
	}

	async list(): Promise<Team[]> {
		const rows = await this.client.team.findMany({
			orderBy: { createdAt: 'desc' },
		});
		return rows.map((row) => this.toDomain(row));
	}

	private toDomain(record: TeamRecord): Team {
		return new Team(Uuid.parse(record.id), Name.create(record.name), null);
	}

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}
}

export { TeamPrismaRepository };
