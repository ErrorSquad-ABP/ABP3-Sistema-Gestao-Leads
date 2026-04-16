import { DealHistoryField } from '../../../../generated/prisma/enums.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import type { Deal } from '../../domain/entities/deal.entity.js';
import type { DealHistoryAppendInput } from '../../domain/repositories/deal-history.repository.js';

type DealSnapshot = {
	readonly title: string;
	readonly value: string | null;
	readonly importance: string;
	readonly stage: string;
	readonly status: string;
};

function snapshotDeal(deal: Deal): DealSnapshot {
	return {
		title: deal.title,
		value: deal.value,
		importance: deal.importance,
		stage: deal.stage,
		status: deal.status,
	};
}

function appendIfChanged(
	out: DealHistoryAppendInput[],
	dealId: Uuid,
	field: (typeof DealHistoryField)[keyof typeof DealHistoryField],
	from: string | null,
	to: string,
	actorUserId: Uuid | null,
): void {
	if (from === to) {
		return;
	}
	out.push({
		id: Uuid.generate(),
		dealId,
		field,
		fromValue: from,
		toValue: to,
		actorUserId,
	});
}

function diffDealHistory(
	dealId: Uuid,
	before: DealSnapshot,
	after: DealSnapshot,
	actorUserId: Uuid | null,
): DealHistoryAppendInput[] {
	const out: DealHistoryAppendInput[] = [];
	appendIfChanged(
		out,
		dealId,
		DealHistoryField.TITLE,
		before.title,
		after.title,
		actorUserId,
	);
	if (
		!(
			(before.value === null && after.value === null) ||
			before.value === after.value
		)
	) {
		out.push({
			id: Uuid.generate(),
			dealId,
			field: DealHistoryField.VALUE,
			fromValue: before.value === null ? null : before.value,
			toValue: after.value === null ? '' : after.value,
			actorUserId,
		});
	}
	appendIfChanged(
		out,
		dealId,
		DealHistoryField.IMPORTANCE,
		before.importance,
		after.importance,
		actorUserId,
	);
	appendIfChanged(
		out,
		dealId,
		DealHistoryField.STAGE,
		before.stage,
		after.stage,
		actorUserId,
	);
	appendIfChanged(
		out,
		dealId,
		DealHistoryField.STATUS,
		before.status,
		after.status,
		actorUserId,
	);
	return out;
}

function initialDealHistory(
	deal: Deal,
	actorUserId: Uuid | null,
): DealHistoryAppendInput[] {
	const id = deal.id;
	const lines: DealHistoryAppendInput[] = [];
	const push = (
		field: (typeof DealHistoryField)[keyof typeof DealHistoryField],
		to: string,
	) => {
		lines.push({
			id: Uuid.generate(),
			dealId: id,
			field,
			fromValue: null,
			toValue: to,
			actorUserId,
		});
	};
	push(DealHistoryField.TITLE, deal.title);
	push(DealHistoryField.VALUE, deal.value === null ? '' : deal.value);
	push(DealHistoryField.IMPORTANCE, deal.importance);
	push(DealHistoryField.STAGE, deal.stage);
	push(DealHistoryField.STATUS, deal.status);
	return lines;
}

export { diffDealHistory, initialDealHistory, snapshotDeal, type DealSnapshot };
