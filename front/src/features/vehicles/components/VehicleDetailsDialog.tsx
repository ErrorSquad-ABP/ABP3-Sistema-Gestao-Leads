'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
	BadgeDollarSign,
	Barcode,
	Calendar,
	CarFront,
	Fuel,
	Gauge,
	IdCard,
	Palette,
	Store,
	Tag,
	Wrench,
} from 'lucide-react';

import { Dialog, DialogContent } from '@/components/ui/dialog';

import type { Vehicle } from '../model/vehicles.model';
import {
	formatFuelType,
	formatMileage,
	formatVehiclePriceBRL,
	formatVehicleStatus,
} from '../lib/vehicle-formatters';
import {
	VehicleModalHeader,
	VehicleModalInfoBanner,
	VehicleModalSection,
	VehicleStatusSummary,
	getVehicleStatusSubtitle,
	vehicleModalContentClass,
} from './VehicleModalLayout';

type VehicleDetailsDialogProps = {
	onClose: () => void;
	open: boolean;
	storeLabelById?: Readonly<Record<string, string>>;
	vehicle: Vehicle | null;
};

type VehicleDetailProps = {
	children: ReactNode;
	icon: LucideIcon;
	label: string;
};

function formatDateTime(value: Date) {
	return value.toLocaleString('pt-BR');
}

function VehicleDetail({ children, icon: Icon, label }: VehicleDetailProps) {
	return (
		<div className="min-w-0 rounded-xl border border-[#e8edf4] bg-[#f9fbfd] px-3 py-2.5">
			<p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#6b7687]">
				<Icon className="size-3.5 shrink-0" />
				{label}
			</p>
			<p className="mt-1 truncate text-sm font-medium text-[#1b2430]">
				{children}
			</p>
		</div>
	);
}

function VehicleDetailsDialog({
	onClose,
	open,
	storeLabelById,
	vehicle,
}: VehicleDetailsDialogProps) {
	if (!vehicle) {
		return null;
	}

	return (
		<Dialog
			onOpenChange={(nextOpen: boolean) => (!nextOpen ? onClose() : null)}
			open={open}
		>
			<DialogContent className={vehicleModalContentClass}>
				<VehicleModalHeader
					description="Consulte a ficha operacional completa do veículo selecionado."
					icon={CarFront}
					title={`${vehicle.brand} ${vehicle.model}`}
				/>

				<div className="min-h-0 space-y-5 overflow-y-auto px-7 pb-7 pt-3 md:px-8">
					<VehicleModalInfoBanner>
						Status atual: {formatVehicleStatus(vehicle.status)} -{' '}
						{getVehicleStatusSubtitle(vehicle.status)}.
					</VehicleModalInfoBanner>

					<div className="grid gap-4 lg:grid-cols-2">
						<VehicleModalSection
							description="Origem e controle do veículo no catálogo."
							title="Contexto do catálogo"
						>
							<div className="grid gap-4 text-sm md:grid-cols-2">
								<VehicleDetail icon={Store} label="Loja">
									{storeLabelById?.[vehicle.storeId] ?? vehicle.storeId}
								</VehicleDetail>
								<VehicleDetail icon={Tag} label="Status">
									{formatVehicleStatus(vehicle.status)}
								</VehicleDetail>
								<VehicleDetail icon={Calendar} label="Criado em">
									{formatDateTime(vehicle.createdAt)}
								</VehicleDetail>
								<VehicleDetail icon={Calendar} label="Atualizado em">
									{formatDateTime(vehicle.updatedAt)}
								</VehicleDetail>
							</div>
						</VehicleModalSection>

						<VehicleModalSection
							description="Marca, modelo, versão, anos e cor cadastrados."
							title="Dados do veículo"
						>
							<div className="grid gap-4 text-sm md:grid-cols-2">
								<VehicleDetail icon={Tag} label="Marca">
									{vehicle.brand}
								</VehicleDetail>
								<VehicleDetail icon={CarFront} label="Modelo">
									{vehicle.model}
								</VehicleDetail>
								<VehicleDetail icon={Wrench} label="Versão">
									{vehicle.version ?? 'Não informada'}
								</VehicleDetail>
								<VehicleDetail icon={Palette} label="Cor">
									{vehicle.color ?? 'Não informada'}
								</VehicleDetail>
								<VehicleDetail icon={Calendar} label="Ano do modelo">
									{vehicle.modelYear}
								</VehicleDetail>
								<VehicleDetail icon={Calendar} label="Ano de fabricação">
									{vehicle.manufactureYear ?? 'Não informado'}
								</VehicleDetail>
							</div>
						</VehicleModalSection>

						<VehicleModalSection
							description="Dados comerciais e operacionais para venda."
							title="Operacional"
						>
							<div className="grid gap-4 text-sm md:grid-cols-2">
								<VehicleDetail icon={Gauge} label="Quilometragem">
									{formatMileage(vehicle.mileage)}
								</VehicleDetail>
								<VehicleDetail icon={Fuel} label="Combustível">
									{formatFuelType(vehicle.supportedFuelType)}
								</VehicleDetail>
								<VehicleDetail icon={BadgeDollarSign} label="Preço">
									{formatVehiclePriceBRL(vehicle.price)}
								</VehicleDetail>
							</div>
						</VehicleModalSection>

						<VehicleModalSection
							description="Informações de identificação e consulta."
							title="Documentos"
						>
							<div className="grid gap-4 text-sm md:grid-cols-2">
								<VehicleDetail icon={IdCard} label="Placa">
									{vehicle.plate ?? 'Não informada'}
								</VehicleDetail>
								<VehicleDetail icon={Barcode} label="Chassi (VIN)">
									{vehicle.vin ?? 'Não informado'}
								</VehicleDetail>
							</div>
						</VehicleModalSection>
					</div>

					<VehicleStatusSummary status={vehicle.status} />
				</div>
			</DialogContent>
		</Dialog>
	);
}

export { VehicleDetailsDialog };
