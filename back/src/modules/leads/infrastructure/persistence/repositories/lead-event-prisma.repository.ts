import { randomUUID } from 'node:crypto';

import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type {
	ILeadEventRepository,
	LeadEventAppendInput,
	LeadEventRow,
} from '../../../domain/repositories/lead-event.repository.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

type LeadEventDelegate = {
	create(args: unknown): Promise<LeadEventRow>;
	findMany(args: unknown): Promise<LeadEventRow[]>;
};

class LeadEventPrismaRepository implements ILeadEventRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	async append(input: LeadEventAppendInput): Promise<LeadEventRow> {
		return this.delegate.create({
			data: {
				id: randomUUID(),
				leadId: input.leadId.value,
				actorUserId:
					input.actorUserId === null ? null : input.actorUserId.value,
				type: input.type,
				title: input.title,
				description: input.description,
				payload: input.payload ?? undefined,
			},
			include: {
				actorUser: { select: { id: true, name: true, email: true } },
			},
		});
	}

	async listByLeadId(leadId: LeadEventAppendInput['leadId']) {
		return this.delegate.findMany({
			where: { leadId: leadId.value },
			include: {
				actorUser: { select: { id: true, name: true, email: true } },
			},
			orderBy: { createdAt: 'desc' },
		});
	}

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}

	private get delegate(): LeadEventDelegate {
		return (
			this.client as PrismaClientLike & {
				readonly leadEvent: LeadEventDelegate;
			}
		).leadEvent;
	}
}

export { LeadEventPrismaRepository };
