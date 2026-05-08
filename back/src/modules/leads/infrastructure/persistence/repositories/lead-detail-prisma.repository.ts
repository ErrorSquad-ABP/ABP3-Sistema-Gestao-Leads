import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type {
	DealHistoryField,
	DealImportance,
	DealStage,
	DealStatus,
	LeadSource,
	LeadStatus,
} from '../../../../../generated/prisma/enums.js';
import type {
	ILeadDetailRepository,
	LeadDetailDealHistoryRow,
	LeadDetailDealRow,
	LeadDetailLeadRow,
} from '../../../domain/repositories/lead-detail.repository.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

type LeadDetailRecord = {
	readonly id: string;
	readonly customerId: string;
	readonly storeId: string;
	readonly ownerUserId: string | null;
	readonly source: LeadSource;
	readonly status: LeadStatus;
	readonly vehicleInterestText: string | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;
	readonly customer: {
		readonly id: string;
		readonly name: string;
		readonly email: string | null;
		readonly phone: string | null;
		readonly cpf: string | null;
	};
	readonly store: { readonly id: string; readonly name: string };
	readonly owner: {
		readonly id: string;
		readonly name: string;
		readonly email: string;
	} | null;
};

type DealDetailRecord = {
	readonly id: string;
	readonly leadId: string;
	readonly vehicleId: string;
	readonly title: string;
	readonly value: { toString(): string } | null;
	readonly importance: DealImportance;
	readonly stage: DealStage;
	readonly status: DealStatus;
	readonly closedAt: Date | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;
	readonly vehicle: {
		readonly id: string;
		readonly brand: string;
		readonly model: string;
		readonly modelYear: number;
		readonly plate: string | null;
	} | null;
};

type DealHistoryDetailRecord = {
	readonly id: string;
	readonly dealId: string;
	readonly field: DealHistoryField;
	readonly fromValue: string | null;
	readonly toValue: string;
	readonly actorUserId: string | null;
	readonly createdAt: Date;
	readonly deal: {
		readonly id: string;
		readonly title: string;
	} | null;
};

function toLeadDetailRow(record: LeadDetailRecord): LeadDetailLeadRow {
	return {
		id: record.id,
		customerId: record.customerId,
		storeId: record.storeId,
		ownerUserId: record.ownerUserId,
		source: record.source,
		status: record.status,
		vehicleInterestText: record.vehicleInterestText,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
		customer: {
			id: record.customer.id,
			name: record.customer.name,
			email: record.customer.email,
			phone: record.customer.phone,
			cpf: record.customer.cpf,
		},
		store: {
			id: record.store.id,
			name: record.store.name,
		},
		owner: record.owner
			? {
					id: record.owner.id,
					name: record.owner.name,
					email: record.owner.email,
				}
			: null,
	};
}

function toDealDetailRow(record: DealDetailRecord): LeadDetailDealRow {
	return {
		id: record.id,
		leadId: record.leadId,
		vehicleId: record.vehicleId,
		title: record.title,
		value: record.value,
		importance: record.importance,
		stage: record.stage,
		status: record.status,
		closedAt: record.closedAt,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
		vehicle: record.vehicle
			? {
					id: record.vehicle.id,
					brand: record.vehicle.brand,
					model: record.vehicle.model,
					modelYear: record.vehicle.modelYear,
					plate: record.vehicle.plate,
				}
			: null,
	};
}

function toDealHistoryDetailRow(
	record: DealHistoryDetailRecord,
): LeadDetailDealHistoryRow {
	return {
		id: record.id,
		dealId: record.dealId,
		field: record.field,
		fromValue: record.fromValue,
		toValue: record.toValue,
		actorUserId: record.actorUserId,
		createdAt: record.createdAt,
		deal: record.deal
			? {
					id: record.deal.id,
					title: record.deal.title,
				}
			: null,
	};
}

class LeadDetailPrismaRepository implements ILeadDetailRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	async findLeadById(id: Parameters<ILeadDetailRepository['findLeadById']>[0]) {
		const lead = await this.client.lead.findUnique({
			where: { id: id.value },
			select: {
				id: true,
				customerId: true,
				storeId: true,
				ownerUserId: true,
				source: true,
				status: true,
				vehicleInterestText: true,
				createdAt: true,
				updatedAt: true,
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
			},
		});
		return lead ? toLeadDetailRow(lead) : null;
	}

	async listDealsByLeadId(
		leadId: Parameters<ILeadDetailRepository['listDealsByLeadId']>[0],
	) {
		const rows = await this.client.deal.findMany({
			where: { leadId: leadId.value },
			select: {
				id: true,
				leadId: true,
				vehicleId: true,
				title: true,
				value: true,
				importance: true,
				stage: true,
				status: true,
				closedAt: true,
				createdAt: true,
				updatedAt: true,
				vehicle: {
					select: {
						id: true,
						brand: true,
						model: true,
						modelYear: true,
						plate: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});
		return rows.map((row) => toDealDetailRow(row));
	}

	async listDealHistoryByLeadId(
		leadId: Parameters<ILeadDetailRepository['listDealHistoryByLeadId']>[0],
	) {
		const rows = await this.client.dealHistory.findMany({
			where: { deal: { leadId: leadId.value } },
			select: {
				id: true,
				dealId: true,
				field: true,
				fromValue: true,
				toValue: true,
				actorUserId: true,
				createdAt: true,
				deal: { select: { id: true, title: true } },
			},
			orderBy: { createdAt: 'desc' },
		});
		return rows.map((row) => toDealHistoryDetailRow(row));
	}

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}
}

export { LeadDetailPrismaRepository };
