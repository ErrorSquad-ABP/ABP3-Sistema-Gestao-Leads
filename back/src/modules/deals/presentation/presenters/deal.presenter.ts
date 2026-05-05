import type { DealHistoryRow } from '../../domain/repositories/deal-history.repository.js';
import type { Deal } from '../../domain/entities/deal.entity.js';
import type { DealHistoryItemDto } from '../../application/dto/deal-history-response.dto.js';
import type { DealResponseDto } from '../../application/dto/deal-response.dto.js';
import type { DealEnrichedRow } from '../../domain/repositories/deal.repository.js';

function formatVehicleLabelFromRow(row: DealEnrichedRow) {
	const v = row.vehicle;
	if (v == null) {
		return 'Veículo não encontrado';
	}
	const brand = v.brand?.trim() || '';
	const model = v.model?.trim() || '';
	const year = v.modelYear;
	const plate = v.plate?.trim() || 'Sem placa';

	/** Sempre que existir ligação com o registro, mostrar marca/modelo/ano, mesmo com dados mínimos. */
	if (brand && model) {
		const y =
			year != null && Number.isFinite(year) && year > 0 ? String(year) : 's/d';
		return `${brand} ${model} ${y} · ${plate}`;
	}
	if (brand) {
		const y =
			year != null && Number.isFinite(year) && year > 0 ? String(year) : 's/d';
		return `${brand} ${y} · ${plate}`;
	}
	return 'Veículo não encontrado';
}

class DealPresenter {
	static toResponse(deal: Deal): DealResponseDto {
		return {
			id: deal.id.value,
			leadId: deal.leadId.value,
			leadCustomerName: 'Cliente não encontrado',
			leadOwnerName: null,
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
			leadOwnerName: row.lead?.owner?.name?.trim()
				? row.lead.owner.name.trim()
				: null,
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
