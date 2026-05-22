'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	Archive,
	ArrowDown,
	ArrowUp,
	Eye,
	Flame,
	Fuel,
	MoreHorizontal,
	PencilLine,
	Trash2,
	UsersRound,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { appRoutes } from '@/lib/routes/app-routes';

import type {
	Vehicle,
	VehicleCatalogItem,
	VehicleStatus,
} from '../model/vehicles.model';
import {
	formatDaysInStock,
	formatFuelType,
	formatMileage,
	formatVehiclePriceBRL,
} from '../lib/vehicle-formatters';
import { formatVehicleStatusLabel } from '../lib/vehicle-labels';
import { VehicleImage } from './VehicleImage';
import {
	VehicleModalHeader,
	VehicleModalSection,
	vehicleModalContentClass,
} from './VehicleModalLayout';

type VehicleCatalogTableProps = {
	items: readonly VehicleCatalogItem[];
	onDeactivate: (vehicle: Vehicle) => void;
	onDelete: (vehicle: Vehicle) => void;
	onEdit: (vehicle: Vehicle) => void;
	onOpenDetails: (vehicle: Vehicle) => void;
};

type InterestCategory = {
	readonly label: string;
	readonly className: string;
	readonly tone: 'hot' | 'warm' | 'purple' | 'neutral' | 'stable';
};

const statusStyles: Record<
	VehicleStatus,
	{ readonly className: string; readonly subtitle: string }
> = {
	AVAILABLE: {
		className: 'border-emerald-100 bg-emerald-50 text-emerald-700',
		subtitle: 'Pronto para venda',
	},
	RESERVED: {
		className: 'border-orange-100 bg-orange-50 text-orange-700',
		subtitle: 'Em negociação',
	},
	SOLD: {
		className: 'border-violet-100 bg-violet-50 text-violet-700',
		subtitle: 'Negócio fechado',
	},
	INACTIVE: {
		className: 'border-slate-100 bg-slate-100 text-slate-600',
		subtitle: 'Fora do catálogo',
	},
};

function getInterestCategory(dealCount: number): InterestCategory {
	if (dealCount >= 5) {
		return {
			label: 'Em alta',
			className: 'border-emerald-100 bg-emerald-50 text-emerald-700',
			tone: 'hot',
		};
	}
	if (dealCount >= 3) {
		return {
			label: 'Quente',
			className: 'border-orange-100 bg-orange-50 text-orange-700',
			tone: 'warm',
		};
	}
	if (dealCount >= 2) {
		return {
			label: 'Alta demanda',
			className: 'border-violet-100 bg-violet-50 text-violet-700',
			tone: 'purple',
		};
	}
	if (dealCount === 1) {
		return {
			label: 'Atenção',
			className: 'border-slate-100 bg-slate-100 text-slate-600',
			tone: 'neutral',
		};
	}
	return {
		label: 'Estável',
		className: 'border-emerald-100 bg-emerald-50 text-emerald-700',
		tone: 'stable',
	};
}

function getPriceComparisonMeta(item: VehicleCatalogItem) {
	switch (item.priceComparison) {
		case 'ABOVE_AVERAGE':
			return {
				label: 'acima da média',
				className: 'bg-emerald-50 text-emerald-700',
				Icon: ArrowUp,
			};
		case 'BELOW_AVERAGE':
			return {
				label: 'abaixo da média',
				className: 'bg-blue-50 text-blue-700',
				Icon: ArrowDown,
			};
		case 'AT_AVERAGE':
			return {
				label: 'na média',
				className: 'bg-slate-100 text-slate-600',
				Icon: null,
			};
		case null:
			return null;
		default: {
			const _exhaustive: never = item.priceComparison;
			return _exhaustive;
		}
	}
}

function InterestBars({ count }: { readonly count: number }) {
	const activeBars = Math.min(3, Math.max(1, count));

	return (
		<div className="mt-1 flex items-center gap-1" aria-hidden="true">
			{[0, 1, 2].map((bar) => (
				<span
					className={`h-1 w-5 rounded-full ${
						bar < activeBars ? 'bg-[#f05a28]' : 'bg-orange-100'
					}`}
					key={bar}
				/>
			))}
		</div>
	);
}

const dealStageLabels: Readonly<Record<string, string>> = {
	INITIAL_CONTACT: 'Contato inicial',
	NEGOTIATION: 'Negociação',
	PROPOSAL: 'Proposta',
	CLOSING: 'Fechamento',
};

function formatCompactDate(value: Date) {
	return value.toLocaleDateString('pt-BR', {
		day: '2-digit',
		month: '2-digit',
		year: '2-digit',
	});
}

function VehicleCatalogTable({
	items,
	onDeactivate,
	onDelete,
	onEdit,
	onOpenDetails,
}: VehicleCatalogTableProps) {
	const router = useRouter();
	const [interestPickerItem, setInterestPickerItem] =
		useState<VehicleCatalogItem | null>(null);

	function openLead(leadId: string) {
		router.push(`${appRoutes.app.leads}/${leadId}`);
	}

	function handleInterestDetails(item: VehicleCatalogItem) {
		if (item.interests.length === 1 && item.interests[0]) {
			openLead(item.interests[0].leadId);
			return;
		}

		if (item.interests.length > 1) {
			setInterestPickerItem(item);
			return;
		}

		onOpenDetails(item.vehicle);
	}

	if (items.length === 0) {
		return (
			<div className="rounded-xl border border-[#dde4ed] bg-white px-4 py-12 text-center text-sm text-[#667085]">
				Nenhum veículo encontrado.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-[#dde4ed] bg-white">
			<Table>
				<TableHeader>
					<TableRow className="h-11 bg-[#f8fafc] hover:bg-[#f8fafc] [&>th]:text-xs [&>th]:font-semibold [&>th]:text-[#344054]">
						<TableHead className="w-10">
							<input
								className="size-4 rounded border-[#b8c4d3]"
								type="checkbox"
								aria-label="Selecionar todos os veículos"
							/>
						</TableHead>
						<TableHead>Veículo</TableHead>
						<TableHead>Loja</TableHead>
						<TableHead>Ano / Modelo</TableHead>
						<TableHead>KM</TableHead>
						<TableHead>Combustível</TableHead>
						<TableHead>Preço</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Interesse</TableHead>
						<TableHead>Tempo parado</TableHead>
						<TableHead className="text-right">Ações</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((item) => {
						const interest = getInterestCategory(item.dealCount);
						const priceMeta = getPriceComparisonMeta(item);
						const PriceIcon = priceMeta?.Icon;
						const status = statusStyles[item.vehicle.status];

						return (
							<TableRow
								key={item.vehicle.id}
								className="h-[4.5rem] border-[#edf1f5] hover:bg-[#f8fafc]"
								onDoubleClick={() => onOpenDetails(item.vehicle)}
							>
								<TableCell>
									<input
										className="size-4 rounded border-[#b8c4d3]"
										type="checkbox"
										aria-label={`Selecionar ${item.vehicle.brand} ${item.vehicle.model}`}
									/>
								</TableCell>
								<TableCell>
									<div className="flex min-w-72 items-center gap-3">
										<VehicleImage
											vehicle={item.vehicle}
											className="h-12 w-24 shrink-0 bg-white"
										/>
										<div className="min-w-0">
											<p className="truncate text-sm font-semibold text-[#101828]">
												{item.vehicle.brand} {item.vehicle.model}
											</p>
											<p className="truncate text-xs text-[#667085]">
												{item.vehicle.version ?? 'Sem versão'} ·{' '}
												{item.vehicle.plate ?? 'Sem placa'}
											</p>
											<Badge
												className={`mt-1 rounded-md border px-1.5 py-0 text-[0.65rem] font-semibold ${interest.className}`}
												variant="outline"
											>
												{interest.tone === 'hot' || interest.tone === 'warm' ? (
													<Flame className="mr-1 size-3" />
												) : null}
												{interest.label}
											</Badge>
										</div>
									</div>
								</TableCell>
								<TableCell className="text-sm text-[#667085]">
									{item.storeName}
								</TableCell>
								<TableCell className="text-sm text-[#667085]">
									{item.vehicle.manufactureYear ?? item.vehicle.modelYear} /{' '}
									{item.vehicle.modelYear}
								</TableCell>
								<TableCell className="text-sm text-[#667085]">
									{formatMileage(item.vehicle.mileage)}
								</TableCell>
								<TableCell>
									<div className="inline-flex items-center gap-1.5 text-sm text-[#667085]">
										<Fuel className="size-4 text-[#667085]" />
										{formatFuelType(item.vehicle.supportedFuelType)}
									</div>
								</TableCell>
								<TableCell>
									<p className="text-sm font-semibold text-[#101828]">
										{formatVehiclePriceBRL(item.vehicle.price)}
									</p>
									{priceMeta ? (
										<span
											className={`mt-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.68rem] font-medium ${priceMeta.className}`}
										>
											{PriceIcon ? <PriceIcon className="size-3" /> : null}
											{priceMeta.label}
										</span>
									) : null}
								</TableCell>
								<TableCell>
									<Badge
										className={`rounded-md border px-2.5 py-1 text-[0.72rem] font-semibold ${status.className}`}
										variant="outline"
									>
										{formatVehicleStatusLabel(item.vehicle.status)}
									</Badge>
									<p className="mt-1 text-xs text-[#667085]">
										{status.subtitle}
									</p>
								</TableCell>
								<TableCell>
									{item.dealCount > 0 ? (
										<div>
											<p className="inline-flex items-center gap-1 text-sm font-semibold text-[#344054]">
												<Flame className="size-4 fill-[#f05a28] text-[#f05a28]" />
												{item.dealCount} lead
												{item.dealCount === 1 ? '' : 's'}
											</p>
											<InterestBars count={item.dealCount} />
											<button
												className="mt-1 text-xs font-medium text-blue-600 hover:underline"
												type="button"
												onClick={() => handleInterestDetails(item)}
											>
												Ver detalhes
											</button>
										</div>
									) : (
										<span className="text-sm text-[#98a2b3]">-</span>
									)}
								</TableCell>
								<TableCell>
									<p className="text-sm font-semibold text-[#344054]">
										{formatDaysInStock(item.daysInStock)}
									</p>
									<p className="mt-1 text-xs text-[#667085]">no estoque</p>
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-1">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													className="rounded-md border-[#d6dce5]"
													size="icon-sm"
													variant="outline"
												>
													<MoreHorizontal className="size-4" />
													<span className="sr-only">Mais ações</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												className="w-44 rounded-xl bg-white"
											>
												<DropdownMenuItem
													className="cursor-pointer rounded-lg px-3 py-2"
													onSelect={() => onOpenDetails(item.vehicle)}
												>
													<Eye className="size-4" />
													Detalhes
												</DropdownMenuItem>
												<DropdownMenuItem
													className="cursor-pointer rounded-lg px-3 py-2"
													onSelect={() => onEdit(item.vehicle)}
												>
													<PencilLine className="size-4" />
													Editar
												</DropdownMenuItem>
												<DropdownMenuItem
													className="cursor-pointer rounded-lg px-3 py-2"
													onSelect={() => onDeactivate(item.vehicle)}
													variant="destructive"
												>
													<Archive className="size-4" />
													Inativar
												</DropdownMenuItem>
												<DropdownMenuItem
													className="cursor-pointer rounded-lg px-3 py-2"
													onSelect={() => onDelete(item.vehicle)}
													variant="destructive"
												>
													<Trash2 className="size-4" />
													Excluir
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			<Dialog
				open={interestPickerItem !== null}
				onOpenChange={(open) => {
					if (!open) {
						setInterestPickerItem(null);
					}
				}}
			>
				<DialogContent className={`${vehicleModalContentClass} max-w-xl`}>
					<VehicleModalHeader
						description={
							interestPickerItem
								? `${interestPickerItem.vehicle.brand} ${interestPickerItem.vehicle.model} possui ${interestPickerItem.interests.length} leads vinculados.`
								: 'Selecione um lead para abrir o detalhe.'
						}
						icon={UsersRound}
						title="Leads interessados"
					/>
					<div className="max-h-[28rem] overflow-y-auto px-7 pt-3 pb-6">
						<VehicleModalSection
							description="Escolha qual negociação deseja consultar."
							title="Interesses vinculados"
						>
							<div className="space-y-2">
								{interestPickerItem?.interests.map((interest) => (
									<button
										type="button"
										key={`${interest.dealId}-${interest.leadId}`}
										className="grid w-full gap-1 rounded-xl border border-[#e5ebf3] bg-white px-4 py-3 text-left transition hover:border-[#f05a28]/40 hover:bg-orange-50/40"
										onClick={() => openLead(interest.leadId)}
									>
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<p className="truncate text-sm font-semibold text-[#101828]">
													{interest.customerName}
												</p>
												<p className="mt-0.5 truncate text-xs text-[#667085]">
													{interest.dealTitle}
												</p>
											</div>
											<span className="shrink-0 rounded-md bg-orange-50 px-2 py-1 text-[0.68rem] font-semibold text-[#f05a28]">
												{dealStageLabels[interest.dealStage] ??
													interest.dealStage}
											</span>
										</div>
										<p className="text-xs text-[#667085]">
											Criado em {formatCompactDate(interest.createdAt)}
										</p>
									</button>
								))}
							</div>
						</VehicleModalSection>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export { VehicleCatalogTable };
