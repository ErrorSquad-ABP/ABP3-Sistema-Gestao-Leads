import type { Uuid } from '../../../../shared/domain/types/identifiers.js';

type LeadDetailUserRow = {
	readonly id: string;
	readonly name: string;
	readonly email: string;
};

type LeadDetailCustomerRow = {
	readonly id: string;
	readonly name: string;
	readonly email: string | null;
	readonly phone: string | null;
	readonly cpf: string | null;
};

type LeadDetailStoreRow = {
	readonly id: string;
	readonly name: string;
};

type LeadDetailLeadRow = {
	readonly id: string;
	readonly customerId: string;
	readonly storeId: string;
	readonly ownerUserId: string | null;
	readonly source: string;
	readonly status: string;
	readonly vehicleInterestText: string | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;
	readonly customer: LeadDetailCustomerRow;
	readonly store: LeadDetailStoreRow;
	readonly owner: LeadDetailUserRow | null;
};

type LeadDetailDealRow = {
	readonly id: string;
	readonly leadId: string;
	readonly vehicleId: string;
	readonly title: string;
	readonly value: { toString(): string } | null;
	readonly importance: string;
	readonly stage: string;
	readonly status: string;
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

type LeadDetailDealHistoryRow = {
	readonly id: string;
	readonly dealId: string;
	readonly field: string;
	readonly fromValue: string | null;
	readonly toValue: string;
	readonly actorUserId: string | null;
	readonly createdAt: Date;
	readonly deal: {
		readonly id: string;
		readonly title: string;
	} | null;
};

interface ILeadDetailRepository {
	findLeadById(id: Uuid): Promise<LeadDetailLeadRow | null>;
	listDealsByLeadId(leadId: Uuid): Promise<readonly LeadDetailDealRow[]>;
	listDealHistoryByLeadId(
		leadId: Uuid,
	): Promise<readonly LeadDetailDealHistoryRow[]>;
}

export type {
	ILeadDetailRepository,
	LeadDetailCustomerRow,
	LeadDetailDealHistoryRow,
	LeadDetailDealRow,
	LeadDetailLeadRow,
	LeadDetailStoreRow,
	LeadDetailUserRow,
};
