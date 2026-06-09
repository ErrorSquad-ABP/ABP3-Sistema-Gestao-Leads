import { Icon } from '@iconify/react';
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
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

import {
	formatLeadSourceLabel,
	formatLeadStatusLabel,
	normalizeLeadSourceKey,
	normalizeLeadStatusKey,
} from '../lib/lead-list-labels';
import type { LeadCatalogItem, LeadListItem } from '../model/leads.model';

const pageSizeOptions = [10, 20, 30, 40, 50] as const;

function formatCount(value: number) {
	return value.toLocaleString('pt-BR');
}

function formatDateDistance(date: Date | null) {
	if (!date) {
		return 'Sem atividade';
	}
	const diffMs = Date.now() - date.getTime();
	const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
	if (diffDays === 0) {
		return `Hoje às ${date.toLocaleTimeString('pt-BR', {
			hour: '2-digit',
			minute: '2-digit',
		})}`;
	}
	if (diffDays === 1) {
		return 'Ontem';
	}
	return `${diffDays} dias atrás`;
}

function getInitials(name: string) {
	const initials = name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0])
		.join('')
		.toUpperCase();
	return initials || 'LD';
}

function statusBadgeClass(status: string) {
	switch (normalizeLeadStatusKey(status)) {
		case 'NEW':
			return 'border-blue-100 bg-blue-50 text-blue-700';
		case 'CONTACTED':
			return 'border-orange-100 bg-orange-50 text-orange-700';
		case 'QUALIFIED':
			return 'border-emerald-100 bg-emerald-50 text-emerald-700';
		case 'CONVERTED':
			return 'border-violet-100 bg-violet-50 text-violet-700';
		case 'LOST':
		case 'DISQUALIFIED':
		case 'DESQUALIFIED':
			return 'border-slate-200 bg-slate-100 text-slate-600';
		default:
			return 'border-slate-200 bg-slate-50 text-slate-600';
	}
}

function SourceIcon({ value }: { readonly value: string }) {
	switch (normalizeLeadSourceKey(value)) {
		case 'WHATSAPP':
			return (
				<Icon className="size-4 text-[#25d366]" icon="simple-icons:whatsapp" />
			);
		case 'INSTAGRAM':
			return (
				<Icon className="size-4 text-[#e4405f]" icon="simple-icons:instagram" />
			);
		case 'FACEBOOK':
			return (
				<Icon className="size-4 text-[#1877f2]" icon="simple-icons:facebook" />
			);
		case 'MERCADO_LIVRE':
			return (
				<Icon
					className="size-5 text-[#101828]"
					icon="arcticons:mercado-libre"
				/>
			);
		case 'PHONE':
		case 'PHONE_CALL':
			return <Phone className="size-4 text-[#2563eb]" />;
		case 'WALK_IN':
		case 'STORE_VISIT':
			return <Store className="size-4 text-[#f97316]" />;
		case 'INDICATION':
			return <UserRound className="size-4 text-[#10b981]" />;
		case 'WEBSITE':
		case 'DIGITAL_FORM':
			return <Globe2 className="size-4 text-[#2563eb]" />;
		default:
			return <Circle className="size-3 text-[#98a2b3]" />;
	}
}

function paginationItems(totalPages: number) {
	if (totalPages <= 5) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}
	return [1, 2, 3, 4, 'ellipsis', totalPages] as const;
}

type LeadsListCardProps = {
	currentPage: number;
	items: readonly LeadCatalogItem[];
	onConvert?: (lead: LeadListItem) => void;
	onDeals?: (lead: LeadListItem) => void;
	onDelete?: (lead: LeadListItem) => void;
	onDetail: (item: LeadCatalogItem) => void;
	onEdit: (lead: LeadListItem) => void;
	onNextPage: () => void;
	onPageChange: (page: number) => void;
	onPageSizeChange: (size: (typeof pageSizeOptions)[number]) => void;
	onPreviousPage: () => void;
	onReassign?: (lead: LeadListItem) => void;
	pageSize: (typeof pageSizeOptions)[number];
	totalItems: number;
	totalPages: number;
};

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
	const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	const to = Math.min(currentPage * pageSize, totalItems);

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
													{item.customer.email ?? 'Sem e-mail'}
												</p>
												<p className="text-xs text-[#667085]">
													{item.customer.phone ?? 'Sem telefone'}
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
										{item.owner?.name ?? 'Sem responsável'}
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
												onDetail={() => onDetail(item)}
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
							item === 'ellipsis' ? (
								<span className="px-2 text-sm text-[#667085]" key="ellipsis">
									...
								</span>
							) : (
								<Button
									className={
										item === currentPage
											? 'size-9 rounded-lg bg-[#fff1eb] text-[#f05a28] hover:bg-[#fff1eb]'
											: 'size-9 rounded-lg text-[#101828]'
									}
									key={item}
									onClick={() => onPageChange(item)}
									type="button"
									variant="ghost"
								>
									{item}
								</Button>
							),
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
									Number(
										event.target.value,
									) as (typeof pageSizeOptions)[number],
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
	);
}

type LeadActionsProps = {
	lead: LeadListItem;
	onConvert?: (lead: LeadListItem) => void;
	onDeals?: (lead: LeadListItem) => void;
	onDelete?: (lead: LeadListItem) => void;
	onDetail?: (lead: LeadListItem) => void;
	onEdit?: (lead: LeadListItem) => void;
	onReassign?: (lead: LeadListItem) => void;
};

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
				{onConvert && lead.status !== 'CONVERTED' ? (
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
	);
}

export { formatCount, LeadsListCard, pageSizeOptions };
