import { useVehicleByIdQuery } from '@/features/vehicles/hooks/vehicles.queries';
import { formatVehicleDealSelectLabel } from '@/features/vehicles/lib/vehicle-formatters';

import { isLikelyUuid, shortenInternalId } from '../lib/deal-labels';

/**
 * Garante abertura de `GET /api/vehicles/:id` quando a listagem de negociação
 * não traz a etiqueta (veículo sem join, dado mínimo, etc.).
 */
function shouldFetchVehicleLabelOnDeal(serverLabel: string | null | undefined) {
	const t = (serverLabel ?? '').trim();
	if (!t) {
		return true;
	}
	if (/ve[ií]culo não encontrado/i.test(t)) {
		return true;
	}
	if (isLikelyUuid(t)) {
		return true;
	}
	return false;
}

function useResolvedVehicleLabel(
	vehicleId: string,
	serverLabel: string | null | undefined,
) {
	const mustFetch = shouldFetchVehicleLabelOnDeal(serverLabel);
	const query = useVehicleByIdQuery(vehicleId, {
		enabled: Boolean(vehicleId) && mustFetch,
	});

	if (!mustFetch) {
		const t = (serverLabel ?? '').trim();
		return {
			displayLabel: t || '—',
			isPending: false,
		} as const;
	}

	if (query.isPending) {
		return {
			displayLabel: 'Carregando veículo…',
			isPending: true,
		} as const;
	}

	if (query.data) {
		return {
			displayLabel: formatVehicleDealSelectLabel(query.data),
			isPending: false,
		} as const;
	}

	const fallback =
		(serverLabel ?? '').trim() ||
		`Ref. veículo ${shortenInternalId(vehicleId)}`;
	return {
		displayLabel: fallback,
		isPending: false,
	} as const;
}

export { useResolvedVehicleLabel };
