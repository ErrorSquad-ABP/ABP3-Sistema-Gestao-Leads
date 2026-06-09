"use client"

import {
	Archive,
	CalendarDays,
	Fuel,
	Gauge,
	MoreHorizontal,
	PencilLine,
	Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type {
	Vehicle,
	VehicleCatalogItem,
	VehicleStatus,
} from "../model/vehicles.model"
import {
	formatFuelType,
	formatMileage,
	formatVehiclePriceBRL,
} from "../lib/vehicle-formatters"
import { formatVehicleStatusLabel } from "../lib/vehicle-labels"
import { VehicleImage } from "./VehicleImage"

type VehicleCatalogCardsProps = {
	items: readonly VehicleCatalogItem[]
	onDeactivate: (vehicle: Vehicle) => void
	onDelete: (vehicle: Vehicle) => void
	onEdit: (vehicle: Vehicle) => void
	onOpenDetails: (vehicle: Vehicle) => void
}

const statusClassName: Record<VehicleStatus, string> = {
	AVAILABLE: "border-emerald-100 bg-emerald-50 text-emerald-700",
	RESERVED: "border-orange-100 bg-orange-50 text-orange-700",
	SOLD: "border-violet-100 bg-violet-50 text-violet-700",
	INACTIVE: "border-slate-100 bg-slate-100 text-slate-600",
}

function VehicleCatalogCards({
	items,
	onDeactivate,
	onDelete,
	onEdit,
	onOpenDetails,
}: VehicleCatalogCardsProps) {
	if (items.length === 0) {
		return (
			<div className="rounded-xl border border-[#dde4ed] bg-white px-4 py-12 text-center text-sm text-[#667085]">
				Nenhum veículo encontrado.
			</div>
		)
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{items.map((item, index) => {
				return (
					<article
						key={item.vehicle.id}
						className="rounded-xl border border-[#dde4ed] bg-white p-3 shadow-sm transition hover:border-[#cbd5e1] hover:shadow-md"
					>
						<div className="flex items-start justify-between gap-2">
							<div className="flex flex-wrap gap-1.5">
								<Badge
									className={`rounded-md border px-2.5 py-1 text-[0.72rem] font-semibold ${statusClassName[item.vehicle.status]}`}
									variant="outline"
								>
									{formatVehicleStatusLabel(item.vehicle.status)}
								</Badge>
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										className="size-8 rounded-md"
										size="icon"
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

						<button
							type="button"
							className="mt-2 block w-full text-left"
							onClick={() => onOpenDetails(item.vehicle)}
						>
							<VehicleImage
								vehicle={item.vehicle}
								className="h-32 w-full"
								priority={index < 4}
							/>
							<div className="mt-3 min-w-0">
								<h2 className="truncate text-sm font-semibold text-[#1b2430]">
									{item.vehicle.brand} {item.vehicle.model}
								</h2>
								<p className="mt-0.5 truncate text-sm text-[#667085]">
									{item.vehicle.version ?? "Sem versão"}{" "}
									{item.vehicle.modelYear}
								</p>
							</div>
						</button>

						<div className="mt-3 grid grid-cols-3 gap-2 text-xs text-[#667085]">
							<span className="inline-flex items-center gap-1">
								<CalendarDays className="size-3.5" />
								{item.vehicle.modelYear}
							</span>
							<span className="inline-flex items-center gap-1">
								<Gauge className="size-3.5" />
								{formatMileage(item.vehicle.mileage)}
							</span>
							<span className="inline-flex min-w-0 items-center gap-1">
								<Fuel className="size-3.5 shrink-0" />
								<span className="truncate">
									{formatFuelType(item.vehicle.supportedFuelType)}
								</span>
							</span>
						</div>

						<div className="mt-3">
							<p className="text-base font-semibold text-[#1b2430]">
								{formatVehiclePriceBRL(item.vehicle.price)}
							</p>
							<p className="mt-1 text-xs text-[#667085]">{item.storeName}</p>
						</div>
					</article>
				)
			})}
		</div>
	)
}

export { VehicleCatalogCards, statusClassName }
