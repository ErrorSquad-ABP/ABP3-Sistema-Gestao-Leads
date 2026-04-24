import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
// biome-ignore lint/style/useImportType: Uuid é classe em runtime
import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import type {
	DealHistoryAppendInput,
	DealHistoryRow,
	IDealHistoryRepository,
} from '../../../domain/repositories/deal-history.repository.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

class DealHistoryPrismaRepository implements IDealHistoryRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	async appendMany(entries: readonly DealHistoryAppendInput[]): Promise<void> {
		if (entries.length === 0) {
			return;
		}
		await this.client.dealHistory.createMany({
			data: entries.map((e) => ({
				id: e.id.value,
				dealId: e.dealId.value,
				field: e.field,
				fromValue: e.fromValue,
				toValue: e.toValue,
				actorUserId: e.actorUserId === null ? null : e.actorUserId.value,
			})),
		});
	}

	async listByDealId(dealId: Uuid): Promise<readonly DealHistoryRow[]> {
		const rows = await this.client.dealHistory.findMany({
			where: { dealId: dealId.value },
			orderBy: { createdAt: 'desc' },
		});
		return rows.map((r) => ({
			id: r.id,
			dealId: r.dealId,
			field: r.field,
			fromValue: r.fromValue,
			toValue: r.toValue,
			actorUserId: r.actorUserId,
			createdAt: r.createdAt,
		}));
	}

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}
}

export { DealHistoryPrismaRepository };
