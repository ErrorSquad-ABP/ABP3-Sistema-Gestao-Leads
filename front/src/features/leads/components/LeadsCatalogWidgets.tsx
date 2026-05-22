import { Icon } from "@iconify/react"
import {
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Circle,
	Eye,
	Globe2,
	Handshake,
	Mail,
	MoreHorizontal,
	Phone,
	Shuffle,
	Store,
	Trash2,
	UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buildConicGradientStopsAccumulating } from "@/lib/conic-gradient"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"

import {
	formatLeadSourceLabel,
	formatLeadStatusLabel,
	normalizeLeadSourceKey,
	normalizeLeadStatusKey,
} from "../lib/lead-list-labels"
import type { LeadCatalogItem, LeadListItem } from "../model/leads.model"

const pageSizeOptions = [10, 20, 30, 40, 50] as const

function formatCount(value: number) {
	return value.toLocaleString("pt-BR")
}

function formatDateDistance(date: Date | null) {
	if (!date) {
		return "Sem atividade"
	}
	const diffMs = Date.now() - date.getTime()
	const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
	if (diffDays === 0) {
		return `Hoje às ${date.toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		})}`
	}
	if (diffDays === 1) {
		return "Ontem"
	}
	return `${diffDays} dias atrás`
}

function getInitials(name: string) {
	const initials = name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase()
	return initials || "LD"
}

function statusBadgeClass(status: string) {
	switch (normalizeLeadStatusKey(status)) {
		case "NEW":
			return "border-blue-100 bg-blue-50 text-blue-700"
		case "CONTACTED":
			return "border-orange-100 bg-orange-50 text-orange-700"
		case "QUALIFIED":
			return "border-emerald-100 bg-emerald-50 text-emerald-700"
		case "CONVERTED":
			return "border-violet-100 bg-violet-50 text-violet-700"
		case "LOST":
		case "DISQUALIFIED":
		case "DESQUALIFIED":
			return "border-slate-200 bg-slate-100 text-slate-600"
		default:
			return "border-slate-200 bg-slate-50 text-slate-600"
	}
}

function SourceIcon({ value }: { readonly value: string }) {
	switch (normalizeLeadSourceKey(value)) {
		case "WHATSAPP":
			return (
				<Icon className="size-4 text-[#25d366]" icon="simple-icons:whatsapp" />
			)
		case "INSTAGRAM":
			return (
				<Icon className="size-4 text-[#e4405f]" icon="simple-icons:instagram" />
			)
		case "FACEBOOK":
			return (
				<Icon className="size-4 text-[#1877f2]" icon="simple-icons:facebook" />
			)
		case "MERCADO_LIVRE":
			return (
				<Icon
					className="size-5 text-[#101828]"
					icon="arcticons:mercado-libre"
				/>
			)
		case "PHONE":
		case "PHONE_CALL":
			return <Phone className="size-4 text-[#2563eb]" />
		case "WALK_IN":
		case "STORE_VISIT":
			return <Store className="size-4 text-[#f97316]" />
		case "INDICATION":
			return <UserRound className="size-4 text-[#10b981]" />
		case "WEBSITE":
		case "DIGITAL_FORM":
			return <Globe2 className="size-4 text-[#2563eb]" />
		default:
			return <Circle className="size-3 text-[#98a2b3]" />
	}
}

function paginationItems(totalPages: number) {
	if (totalPages <= 5) {
		return Array.from({ length: totalPages }, (_, index) => index + 1)
	}
	return [1, 2, 3, 4, "ellipsis", totalPages] as const
}

type LeadsListCardProps = {
	currentPage: number
	items: readonly LeadCatalogItem[]
	onConvert?: (lead: LeadListItem) => void
	onDeals?: (lead: LeadListItem) => void
	onDelete?: (lead: LeadListItem) => void
	onDetail: (lead: LeadListItem) => void
	onEdit: (lead: LeadListItem) => void
	onNextPage: () => void
	onPageChange: (page: number) => void
	onPageSizeChange: (size: (typeof pageSizeOptions)[number]) => void
	onPreviousPage: () => void
	onReassign?: (lead: LeadListItem) => void
	pageSize: (typeof pageSizeOptions)[number]
	totalItems: number
	totalPages: number
}

function LeadsListCard({
	currentPage,
	items,
	onConvert,
	onDeals,
	onDelete,
	onDetail,
	onEdit,
	onNextPage,
	onPageChange,
	onPageSizeChange,
	onPreviousPage,
	onReassign,
	pageSize,
	totalItems,
	totalPages,
}: LeadsListCardProps) {
	const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
	const to = Math.min(currentPage * pageSize, totalItems)

	return (
		<Card className="overflow-hidden rounded-3xl border-[#dfe7f1] bg-white">
			<CardContent className="p-0">
				<div className="flex items-center gap-3 px-5 py-5">
					<h2 className="text-base font-bold text-[#101828]">Lista de leads</h2>
					<Badge className="rounded-full bg-[#f1f4f8] px-3 py-1 text-xs font-medium text-[#667085]">
						{formatCount(totalItems)} leads encontrados
					</Badge>
				</div>
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow className="border-[#e7edf5] hover:bg-white">
								<TableHead>Lead</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Cliente</TableHead>
								<TableHead>Origem</TableHead>
								<TableHead>Responsável</TableHead>
								<TableHead>Última atividade</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.map((item) => (
								<TableRow
									className="border-[#e7edf5] hover:bg-[#f8fafc]"
									key={item.lead.id}
								>
									<TableCell>
										<div className="flex items-center gap-3">
											<span className="flex size-10 items-center justify-center rounded-full bg-[#f1f4f8] text-xs font-semibold text-[#667085]">
												{getInitials(item.customer.name)}
											</span>
											<div>
												<p className="font-semibold text-[#101828]">
													{item.customer.name}
												</p>
												<p className="text-xs text-[#667085]">
													{item.customer.email ?? "Sem e-mail"}
												</p>
												<p className="text-xs text-[#667085]">
													{item.customer.phone ?? "Sem telefone"}
												</p>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<span
											className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(item.lead.status)}`}
										>
											{formatLeadStatusLabel(item.lead.status)}
										</span>
									</TableCell>
									<TableCell className="text-sm text-[#344054]">
										{item.customer.name}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2 text-sm text-[#344054]">
											<SourceIcon value={item.lead.source} />
											<span>{formatLeadSourceLabel(item.lead.source)}</span>
										</div>
									</TableCell>
									<TableCell className="text-sm text-[#344054]">
										{item.owner?.name ?? "Sem responsável"}
									</TableCell>
									<TableCell>
										<p className="text-sm font-medium text-[#344054]">
											{formatDateDistance(item.lastActivityAt)}
										</p>
										<p className="text-xs text-[#667085]">
											{item.lastActivityLabel}
										</p>
									</TableCell>
									<TableCell>
										<div className="flex items-center justify-end">
											<LeadActions
												lead={item.lead}
												onConvert={onConvert}
												onDeals={onDeals}
												onDelete={onDelete}
												onDetail={onDetail}
												onEdit={onEdit}
												onReassign={onReassign}
											/>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
				{items.length === 0 ? (
					<div className="px-5 py-10 text-center text-sm text-[#667085]">
						Nenhum lead encontrado.
					</div>
				) : null}
				<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-t border-[#e7edf5] px-5 py-4">
					<p className="text-sm text-[#667085]">
						Mostrando {from} a {to} de {formatCount(totalItems)} leads
					</p>
					<div className="flex items-center gap-2">
						<Button
							className="size-9 rounded-lg border-[#d8e0ea]"
							disabled={currentPage <= 1}
							onClick={onPreviousPage}
							type="button"
							variant="outline"
						>
							<ChevronLeft className="size-4" />
						</Button>
						{paginationItems(Math.max(totalPages, 1)).map((item) =>
							item === "ellipsis" ? (
								<span className="px-2 text-sm text-[#667085]" key="ellipsis">
									...
								</span>
							) : (
								<Button
									className={
										item === currentPage
											? "size-9 rounded-lg bg-[#fff1eb] text-[#f05a28] hover:bg-[#fff1eb]"
											: "size-9 rounded-lg text-[#101828]"
									}
									key={item}
									onClick={() => onPageChange(item)}
									type="button"
									variant="ghost"
								>
									{item}
								</Button>
							)
						)}
						<Button
							className="size-9 rounded-lg border-[#d8e0ea]"
							disabled={currentPage >= Math.max(totalPages, 1)}
							onClick={onNextPage}
							type="button"
							variant="outline"
						>
							<ChevronRight className="size-4" />
						</Button>
					</div>
					<div className="flex items-center justify-end gap-3">
						<span className="text-sm text-[#667085]">Itens por página:</span>
						<select
							className="h-9 rounded-lg border border-[#d8e0ea] bg-white px-3 text-sm outline-none"
							onChange={(event) =>
								onPageSizeChange(
									Number(event.target.value) as (typeof pageSizeOptions)[number]
								)
							}
							value={pageSize}
						>
							{pageSizeOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

type LeadActionsProps = {
	lead: LeadListItem
	onConvert?: (lead: LeadListItem) => void
	onDeals?: (lead: LeadListItem) => void
	onDelete?: (lead: LeadListItem) => void
	onDetail?: (lead: LeadListItem) => void
	onEdit?: (lead: LeadListItem) => void
	onReassign?: (lead: LeadListItem) => void
}

function LeadActions({
	lead,
	onConvert,
	onDeals,
	onDelete,
	onDetail,
	onEdit,
	onReassign,
}: LeadActionsProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className="size-9 rounded-lg border-[#d8e0ea]"
					size="icon"
					type="button"
					variant="outline"
				>
					<MoreHorizontal className="size-4" />
					<span className="sr-only">Ações do lead</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-44 rounded-xl bg-white">
				{onDetail ? (
					<DropdownMenuItem onSelect={() => onDetail(lead)}>
						<Eye className="size-4" />
						Ver detalhe
					</DropdownMenuItem>
				) : null}
				{onDeals ? (
					<DropdownMenuItem onSelect={() => onDeals(lead)}>
						<Handshake className="size-4" />
						Negociações
					</DropdownMenuItem>
				) : null}
				{onEdit ? (
					<DropdownMenuItem onSelect={() => onEdit(lead)}>
						<Mail className="size-4" />
						Editar
					</DropdownMenuItem>
				) : null}
				{onReassign ? (
					<DropdownMenuItem onSelect={() => onReassign(lead)}>
						<Shuffle className="size-4" />
						Reatribuir
					</DropdownMenuItem>
				) : null}
				{onConvert && lead.status !== "CONVERTED" ? (
					<DropdownMenuItem onSelect={() => onConvert(lead)}>
						<CheckCircle2 className="size-4" />
						Converter
					</DropdownMenuItem>
				) : null}
				{onDelete ? (
					<DropdownMenuItem
						onSelect={() => onDelete(lead)}
						variant="destructive"
					>
						<Trash2 className="size-4" />
						Excluir
					</DropdownMenuItem>
				) : null}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

function FunnelCard({
	converted,
	openDeals,
	totalLeads,
	withInteraction,
}: {
	readonly converted: number
	readonly openDeals: number
	readonly totalLeads: number
	readonly withInteraction: number
}) {
	const rows = [
		{
			label: "Total de leads",
			value: totalLeads,
			color: "#1f2937",
			width: "100%",
			height: "36px",
			clipPath: "polygon(2% 0, 98% 0, 91% 100%, 9% 100%)",
			borderRadius: "14px 14px 7px 7px",
		},
		{
			label: "Leads com interação",
			value: withInteraction,
			color: "#f05a28",
			width: "78%",
			height: "36px",
			clipPath: "polygon(4% 0, 96% 0, 88% 100%, 12% 100%)",
			borderRadius: "12px 12px 7px 7px",
		},
		{
			label: "Negociações abertas",
			value: openDeals,
			color: "#fbbf24",
			width: "56%",
			height: "36px",
			clipPath: "polygon(6% 0, 94% 0, 84% 100%, 16% 100%)",
			borderRadius: "10px 10px 7px 7px",
		},
		{
			label: "Leads convertidos",
			value: converted,
			color: "#94a3b8",
			width: "34%",
			height: "28px",
			clipPath: "polygon(10% 0, 90% 0, 78% 100%, 22% 100%)",
			borderRadius: "8px 8px 6px 6px",
		},
	] as const

	return (
		<Card className="rounded-3xl border-[#dfe7f1] bg-white">
			<CardContent className="p-5">
				<div className="mb-5 flex items-center justify-between">
					<h2 className="text-base font-bold text-[#101828]">
						Resumo do funil
					</h2>
					<span className="text-xs font-semibold text-[#f05a28]">
						Ver funil completo
					</span>
				</div>
				<div className="grid grid-cols-[6.5rem_1fr] gap-5">
					<div className="space-y-3.5">
						{rows.map((row) => (
							<div
								className="mx-auto shadow-[0_8px_14px_rgba(15,23,42,0.14)]"
								key={row.label}
								style={{
									width: row.width,
									height: row.height,
									backgroundColor: row.color,
									clipPath: row.clipPath,
									borderRadius: row.borderRadius,
								}}
							/>
						))}
					</div>
					<div className="space-y-3.5">
						{rows.map((row) => (
							<div
								className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm"
								key={row.label}
								style={{ height: row.height }}
							>
								<span className="font-medium text-[#344054]">{row.label}</span>
								<span className="font-semibold text-[#101828]">
									{formatCount(row.value)}
								</span>
								<span className="text-xs text-[#667085]">
									{totalLeads > 0
										? Math.round((row.value / totalLeads) * 100)
										: 0}
									%
								</span>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

function OriginsCard({
	origins,
	total,
}: {
	readonly origins: readonly {
		readonly label: string
		readonly count: number
	}[]
	readonly total: number
}) {
	function colorForIndex(index: number) {
		switch (index) {
			case 0:
				return "#22c55e"
			case 1:
				return "#ec4899"
			case 2:
				return "#f97316"
			case 3:
				return "#3b82f6"
			default:
				return "#94a3b8"
		}
	}

	const segments = origins.map((item, index) => ({
		...item,
		color: colorForIndex(index),
		percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
	}))
	const gradient = buildConicGradientStopsAccumulating(segments)

	return (
		<Card className="rounded-3xl border-[#dfe7f1] bg-white">
			<CardContent className="p-5">
				<div className="mb-5 flex items-center justify-between">
					<div>
						<h2 className="text-base font-bold text-[#101828]">
							Leads por origem
						</h2>
						<p className="text-xs text-[#667085]">
							Canais que mais geram leads.
						</p>
					</div>
					<span className="text-xs font-semibold text-[#f05a28]">
						Ver todas
					</span>
				</div>
				<div className="grid items-center gap-6 md:grid-cols-[0.9fr_1.1fr]">
					<div className="flex justify-center">
						<div
							className="relative flex size-40 items-center justify-center rounded-full"
							style={{
								background: `conic-gradient(${gradient || "#e5e7eb 0% 100%"})`,
							}}
						>
							<div className="flex size-24 flex-col items-center justify-center rounded-full bg-white">
								<span className="text-2xl font-bold text-[#101828]">
									{formatCount(total)}
								</span>
								<span className="text-xs text-[#667085]">Total</span>
							</div>
						</div>
					</div>
					<div className="space-y-3">
						{segments.map((item) => (
							<div
								className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm"
								key={item.label}
							>
								<div className="flex items-center gap-2">
									<span
										className="size-2.5 rounded-full"
										style={{ backgroundColor: item.color }}
									/>
									<span className="text-[#344054]">
										{formatLeadSourceLabel(item.label)}
									</span>
								</div>
								<span className="font-medium text-[#667085]">
									{formatCount(item.count)} ({item.percentage}%)
								</span>
							</div>
						))}
						{segments.length === 0 ? (
							<p className="text-sm text-[#667085]">Sem dados suficientes.</p>
						) : null}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export { FunnelCard, formatCount, LeadsListCard, OriginsCard, pageSizeOptions }
