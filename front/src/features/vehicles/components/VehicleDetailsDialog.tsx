'use client';

import { Calendar, Car, Palette, Tag, Wrench, Building2 } from 'lucide-react';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

import type { Vehicle } from '../model/vehicles.model';
import { formatFuelType, formatMileage, formatVehiclePriceBRL, formatVehicleStatus } from '../lib/vehicle-formatters';

type VehicleDetailsDialogProps = {
	onClose: () => void;
	open: boolean;
	storeLabelById?: Readonly<Record<string, string>>;
	vehicle: Vehicle | null;
};

function formatDateTime(value: Date) {
	return value.toLocaleString('pt-BR');
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
			<DialogContent className="flex max-w-5xl flex-col rounded-[1.75rem] border border-[#d8e0ea] bg-white">
				<DialogHeader className="gap-3 border-b border-[#e5ebf3] px-8 py-7">
					<div className="flex items-center gap-4">
						<div className="flex size-13 items-center justify-center rounded-2xl border border-[#d96c3f]/15 bg-[#d96c3f]/10 text-[#d96c3f]">
							<Car className="size-6" />
						</div>
						<div className="space-y-1">
							<p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#d96c3f]">
								Veículos
							</p>
							<DialogTitle>
								{vehicle.brand} {vehicle.model}
							</DialogTitle>
							<DialogDescription className="max-w-2xl">
								Ficha completa do veículo selecionado.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="px-8 pb-8 pt-7">
					<div className="grid gap-4 lg:grid-cols-2">
						<div className="rounded-3xl border border-[#e5ebf3] bg-white p-5">
							<div className="flex items-center gap-2 text-sm font-semibold text-[#1b2430]">
								<Building2 className="size-4 text-[#d96c3f]" />
								Contexto do catálogo
							</div>
							<div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
										Loja
									</p>
									<p className="mt-1 text-[#1b2430]">
										{storeLabelById?.[vehicle.storeId] ?? vehicle.storeId}
									</p>
								</div>
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
										Status
									</p>
									<p className="mt-1 text-[#1b2430]">
										{formatVehicleStatus(vehicle.status)}
									</p>
								</div>
								<div>
									<p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
										<Calendar className="size-3.5" />
										Criado em
									</p>
									<p className="mt-1 text-[#1b2430]">
										{formatDateTime(vehicle.createdAt)}
									</p>
								</div>
								<div>
									<p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
										<Calendar className="size-3.5" />
										Atualizado em
									</p>
									<p className="mt-1 text-[#1b2430]">
										{formatDateTime(vehicle.updatedAt)}
									</p>
								</div>
							</div>
						</div>

						<div className="rounded-3xl border border-[#e5ebf3] bg-white p-5">
							<div className="flex items-center gap-2 text-sm font-semibold text-[#1b2430]">
								<Wrench className="size-4 text-[#d96c3f]" />
								Dados do veículo
							</div>
							<div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
										Marca
									</p>
									<p className="mt-1 text-[#1b2430]">{vehicle.brand}</p>
								</div>
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
										Modelo
									</p>
									<p className="mt-1 text-[#1b2430]">{vehicle.model}</p>
								</div>
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
										Versão
									</p>
									<p className="mt-1 text-[#1b2430]">
										{vehicle.version ?? 'Não informada'}
									</p>
								</div>
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
										Cor
									</p>
									<p className="mt-1 text-[#1b2430]">
										{vehicle.color ?? 'Não informada'}
									</p>
								</div>
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
										Ano do modelo
									</p>
									<p className="mt-1 text-[#1b2430]">{vehicle.modelYear}</p>
								</div>
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
										Ano de fabricação
									</p>
									<p className="mt-1 text-[#1b2430]">
										{vehicle.manufactureYear ?? 'Não informado'}
									</p>
								</div>
							</div>
						</div>

						<div className="rounded-3xl border border-[#e5ebf3] bg-white p-5">
							<div className="flex items-center gap-2 text-sm font-semibold text-[#1b2430]">
								<Tag className="size-4 text-[#d96c3f]" />
								Operacional
							</div>
							<div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
										Quilometragem
									</p>
									<p className="mt-1 text-[#1b2430]">
										{formatMileage(vehicle.mileage)}
									</p>
								</div>
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
										Combustível
									</p>
									<p className="mt-1 text-[#1b2430]">
										{formatFuelType(vehicle.supportedFuelType)}
									</p>
								</div>
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
										Preço
									</p>
									<p className="mt-1 text-[#1b2430]">
										{formatVehiclePriceBRL(vehicle.price)}
									</p>
								</div>
							</div>
						</div>

						<div className="rounded-3xl border border-[#e5ebf3] bg-white p-5">
							<div className="flex items-center gap-2 text-sm font-semibold text-[#1b2430]">
								<Palette className="size-4 text-[#d96c3f]" />
								Documentos
							</div>
							<div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
										Placa
									</p>
									<p className="mt-1 text-[#1b2430]">
										{vehicle.plate ?? 'Não informada'}
									</p>
								</div>
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
										Chassi (VIN)
									</p>
									<p className="mt-1 text-[#1b2430]">
										{vehicle.vin ?? 'Não informado'}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export { VehicleDetailsDialog };

