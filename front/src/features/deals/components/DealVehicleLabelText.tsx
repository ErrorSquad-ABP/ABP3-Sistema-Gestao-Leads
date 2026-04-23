'use client';

import { useResolvedVehicleLabel } from '../hooks/use-resolved-vehicle-label';

type DealVehicleLabelTextProps = {
	vehicleId: string;
	/** Rótulo vindo do endpoint enriquecido; pode ser vazio se o veículo não entrou no join. */
	serverLabel: string | null | undefined;
	className?: string;
};

/**
 * Nome comercial do veículo (marca, modelo, ano, placa), resolvido por API se necessário.
 */
function DealVehicleLabelText({
	vehicleId,
	serverLabel,
	className,
}: DealVehicleLabelTextProps) {
	const { displayLabel, isPending } = useResolvedVehicleLabel(
		vehicleId,
		serverLabel,
	);
	return (
		<span className={className} data-pending={isPending ? 'true' : undefined}>
			{displayLabel}
		</span>
	);
}

export { DealVehicleLabelText };
