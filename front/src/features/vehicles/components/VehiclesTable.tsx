'use client';

import { MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';

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

import type { Vehicle } from '../model/vehicles.model';
import {
	formatFuelType,
	formatMileage,
	formatVehiclePriceBRL,
	formatVehicleStatus,
} from '../lib/vehicle-formatters';

type VehiclesTableProps = {
	storeLabelById?: Readonly<Record<string, string>>;
	vehicles: Vehicle[];
	onDeactivate?: (vehicle: Vehicle) => void;
	onEdit?: (vehicle: Vehicle) => void;
	onOpenDetails?: (vehicle: Vehicle) => void;
};

function VehiclesTable({
	storeLabelById,
	vehicles,
	onDeactivate,
	onEdit,
	onOpenDetails,
}: VehiclesTableProps) {
	if (vehicles.length === 0) {
		return (
			<div className="rounded-2xl border border-border/80 bg-card px-4 py-10 text-center text-sm text-[#6b7687]">
				Nenhum veículo encontrado.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
			<Table>
				<TableHeader className="[&_tr]:border-[#e6ecf3]">
					<TableRow className="bg-[#f8fafc] hover:bg-[#f8fafc]">
						<TableHead>Loja</TableHead>
						<TableHead>Veículo</TableHead>
						<TableHead>Ano</TableHead>
						<TableHead>KM</TableHead>
						<TableHead>Combustível</TableHead>
						<TableHead>Preço</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="w-18 text-right">Ações</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody className="[&_tr]:border-[#e6ecf3]">
					{vehicles.map((vehicle) => (
						<TableRow
							className="odd:bg-[#f8fafc]/40 hover:bg-[#f8fafc]/80"
							key={vehicle.id}
							onDoubleClick={() => onOpenDetails?.(vehicle)}
						>
							<TableCell className="text-sm text-[#6b7687]">
								{storeLabelById?.[vehicle.storeId] ?? vehicle.storeId}
							</TableCell>
							<TableCell>
								<p className="font-medium text-[#1b2430]">
									{vehicle.brand} {vehicle.model}
								</p>
								<p className="mt-0.5 text-sm text-[#6b7687]">
									{vehicle.version ?? 'Sem versão'}
								</p>
							</TableCell>
							<TableCell className="text-sm text-[#6b7687]">
								{vehicle.modelYear}
							</TableCell>
							<TableCell className="text-sm text-[#6b7687]">
								{formatMileage(vehicle.mileage)}
							</TableCell>
							<TableCell className="text-sm text-[#6b7687]">
								{formatFuelType(vehicle.supportedFuelType)}
							</TableCell>
							<TableCell className="text-sm text-[#6b7687]">
								{formatVehiclePriceBRL(vehicle.price)}
							</TableCell>
							<TableCell>
								<Badge
									className="rounded-md px-2.5 py-1 text-[0.72rem] font-medium"
									variant="outline"
								>
									{formatVehicleStatus(vehicle.status)}
								</Badge>
							</TableCell>
							<TableCell className="text-right">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											className="rounded-md"
											size="icon-sm"
											variant="ghost"
										>
											<MoreHorizontal className="size-4" />
											<span className="sr-only">Ações do veículo</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="w-44 rounded-xl bg-white"
									>
										{onEdit ? (
											<DropdownMenuItem
												className="cursor-pointer rounded-lg px-3 py-2 text-[#1b2430] hover:bg-[#d96c3f]/10! hover:text-[#D96C3F]!"
												onSelect={() => onEdit(vehicle)}
											>
												<PencilLine className="size-4" />
												Editar
											</DropdownMenuItem>
										) : null}
										{onDeactivate ? (
											<DropdownMenuItem
												className="cursor-pointer rounded-lg px-3 py-2"
												onSelect={() => onDeactivate(vehicle)}
												variant="destructive"
											>
												<Trash2 className="size-4" />
												Inativar
											</DropdownMenuItem>
										) : null}
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

export { VehiclesTable };
