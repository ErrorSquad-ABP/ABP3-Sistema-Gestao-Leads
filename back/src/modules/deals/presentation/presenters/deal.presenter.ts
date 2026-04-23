import type { DealHistoryRow } from '../../domain/repositories/deal-history.repository.js';
import type { Deal } from '../../domain/entities/deal.entity.js';
import type { DealHistoryItemDto } from '../../application/dto/deal-history-response.dto.js';
import type { DealResponseDto } from '../../application/dto/deal-response.dto.js';
import type { DealEnrichedRow } from '../../domain/repositories/deal.repository.js';

function formatVehicleLabelFromRow(row: DealEnrichedRow) {
	const brand = row.vehicle?.brand?.trim() || '';
	const model = row.vehicle?.model?.trim() || '';
	const year = row.vehicle?.modelYear;
	const plate = row.vehicle?.plate?.trim() || 'Sem placa';

	if (!brand || !model || !year) {
		return 'Veículo não encontrado';
	}

	return `${brand} ${model} ${year} · ${plate}`;
}

class DealPresenter {
	static toResponse(deal: Deal): DealResponseDto {
		return {
			id: deal.id.value,
			leadId: deal.leadId.value,
			leadCustomerName: 'Cliente não encontrado',
			vehicleId: deal.vehicleId.value,
			vehicleLabel: 'Veículo não encontrado',
			title: deal.title,
			value: deal.value === null ? null : deal.value.toDecimalString(),
			importance: deal.importance,
			stage: deal.stage,
			status: deal.status,
			closedAt: deal.closedAt,
			createdAt: deal.createdAt,
			updatedAt: deal.updatedAt,
			canMutate: false,
		} as DealResponseDto;
	}

	static toResponseList(deals: readonly Deal[]): DealResponseDto[] {
		return deals.map((d) => DealPresenter.toResponse(d));
	}

	static toResponseEnriched(
		row: DealEnrichedRow,
		canMutate: boolean,
	): DealResponseDto {
		return {
			id: row.id,
			leadId: row.leadId,
			leadCustomerName: row.lead?.customer?.name ?? 'Cliente não encontrado',
			vehicleId: row.vehicleId,
			vehicleLabel: formatVehicleLabelFromRow(row),
			title: row.title,
			value: row.value === null ? null : row.value.toString(),
			importance: row.importance as DealResponseDto['importance'],
			stage: row.stage as DealResponseDto['stage'],
			status: row.status as DealResponseDto['status'],
			closedAt: row.closedAt,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
			canMutate,
		} as DealResponseDto;
	}

	static toResponseListEnriched(
		rows: readonly {
			readonly row: DealEnrichedRow;
			readonly canMutate: boolean;
		}[],
	): DealResponseDto[] {
		return rows.map((r) =>
			DealPresenter.toResponseEnriched(r.row, r.canMutate),
		);
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
