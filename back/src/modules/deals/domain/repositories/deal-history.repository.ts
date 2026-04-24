import type { DealHistoryField } from '../../../../generated/prisma/enums.js';
import type { Uuid } from '../../../../shared/domain/types/identifiers.js';

type DealHistoryAppendInput = {
	readonly id: Uuid;
	readonly dealId: Uuid;
	readonly field: DealHistoryField;
	readonly fromValue: string | null;
	readonly toValue: string;
	readonly actorUserId: Uuid | null;
};

interface IDealHistoryRepository {
	appendMany(entries: readonly DealHistoryAppendInput[]): Promise<void>;
	listByDealId(dealId: Uuid): Promise<readonly DealHistoryRow[]>;
}

type DealHistoryRow = {
	readonly id: string;
	readonly dealId: string;
	readonly field: DealHistoryField;
	readonly fromValue: string | null;
	readonly toValue: string;
	readonly actorUserId: string | null;
	readonly createdAt: Date;
};

export type { DealHistoryAppendInput, DealHistoryRow, IDealHistoryRepository };
