import type { DealHistoryRow } from '../../domain/repositories/deal-history.repository.js';
import type { Deal } from '../../domain/entities/deal.entity.js';
import type { DealHistoryItemDto } from '../../application/dto/deal-history-response.dto.js';
import type { DealResponseDto } from '../../application/dto/deal-response.dto.js';

class DealPresenter {
	static toResponse(deal: Deal): DealResponseDto {
		return {
			id: deal.id.value,
			leadId: deal.leadId.value,
			title: deal.title,
			value: deal.value,
			importance: deal.importance,
			stage: deal.stage,
			status: deal.status,
			closedAt: deal.closedAt,
			createdAt: deal.createdAt,
			updatedAt: deal.updatedAt,
		} as DealResponseDto;
	}

	static toResponseList(deals: readonly Deal[]): DealResponseDto[] {
		return deals.map((d) => DealPresenter.toResponse(d));
	}

	static toHistoryItem(row: DealHistoryRow): DealHistoryItemDto {
		return {
			id: row.id,
			dealId: row.dealId,
			field: row.field,
			fromValue: row.fromValue,
			toValue: row.toValue,
			actorUserId: row.actorUserId,
			createdAt: row.createdAt,
		} as DealHistoryItemDto;
	}

	static toHistoryList(rows: readonly DealHistoryRow[]): DealHistoryItemDto[] {
		return rows.map((r) => DealPresenter.toHistoryItem(r));
	}
}

export { DealPresenter };
