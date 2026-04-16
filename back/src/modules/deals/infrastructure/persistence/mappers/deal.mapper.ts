import type { Deal as PrismaDeal } from '../../../../../generated/prisma/client.js';
import { assertCanonicalDealImportance } from '../../../../../shared/domain/enums/deal-importance.enum.js';
import { assertCanonicalDealStage } from '../../../../../shared/domain/enums/deal-stage.enum.js';
import { assertCanonicalDealStatus } from '../../../../../shared/domain/enums/deal-status.enum.js';
import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import { Money } from '../../../../../shared/domain/value-objects/money.value-object.js';
import { Deal } from '../../../domain/entities/deal.entity.js';

class DealMapper {
	static toDomain(record: PrismaDeal): Deal {
		const value =
			record.value === null || record.value === undefined
				? null
				: Money.fromDecimalString(record.value.toString());
		return new Deal(
			Uuid.parse(record.id),
			Uuid.parse(record.leadId),
			Uuid.parse(record.vehicleId),
			record.title,
			value,
			assertCanonicalDealImportance(record.importance),
			assertCanonicalDealStage(record.stage),
			assertCanonicalDealStatus(record.status),
			record.closedAt,
			record.createdAt,
			record.updatedAt,
		);
	}

	static toPersistence(deal: Deal): {
		readonly id: string;
		readonly leadId: string;
		readonly vehicleId: string;
		readonly title: string;
		readonly value: string | null;
		readonly importance: PrismaDeal['importance'];
		readonly stage: PrismaDeal['stage'];
		readonly status: PrismaDeal['status'];
		readonly closedAt: Date | null;
	} {
		return {
			id: deal.id.value,
			leadId: deal.leadId.value,
			vehicleId: deal.vehicleId.value,
			title: deal.title,
			value: deal.value === null ? null : deal.value.toDecimalString(),
			importance: deal.importance,
			stage: deal.stage,
			status: deal.status,
			closedAt: deal.closedAt,
		};
	}
}

export { DealMapper };
