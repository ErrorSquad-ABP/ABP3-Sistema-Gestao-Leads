'use client';

import {
	CheckCheck,
	MoreHorizontal,
	PencilLine,
	Shuffle,
	Trash2,
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

import {
	formatLeadSourceLabel,
	formatLeadStatusLabel,
	formatShortId,
} from '../lib/lead-list-labels';
import type { LeadListItem } from '../types/leads.types';

type LeadsTableProps = {
	customerLabelById?: Readonly<Record<string, string>>;
	leads: LeadListItem[];
	onConvert?: (lead: LeadListItem) => void;
	onDelete?: (lead: LeadListItem) => void;
	onEdit?: (lead: LeadListItem) => void;
	onReassign?: (lead: LeadListItem) => void;
	ownerLabelById?: Readonly<Record<string, string>>;
	storeLabelById?: Readonly<Record<string, string>>;
};

function statusBadgeVariant(
	status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
	switch (status) {
		case 'CONVERTED':
			return 'default';
		case 'DISQUALIFIED':
			return 'destructive';
		case 'NEW':
			return 'secondary';
		default:
			return 'outline';
	}
}

function LeadsTable({
	customerLabelById,
	leads,
	onConvert,
	onDelete,
	onEdit,
	onReassign,
	ownerLabelById,
	storeLabelById,
}: LeadsTableProps) {
	if (leads.length === 0) {
		return (
			<div className="rounded-2xl border border-border/80 bg-card px-4 py-10 text-center text-sm text-[#6b7687]">
				Nenhum lead encontrado.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
			<Table>
				<TableHeader className="[&_tr]:border-[#e6ecf3]">
					<TableRow className="bg-[#f8fafc] hover:bg-[#f8fafc]">
						<TableHead className="px-4">Lead</TableHead>
						<TableHead>Origem</TableHead>
						<TableHead>Estado</TableHead>
						<TableHead>Cliente</TableHead>
						<TableHead>Loja</TableHead>
						<TableHead>Responsável</TableHead>
						<TableHead className="w-[4.5rem] text-right">Ações</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody className="[&_tr]:border-[#e6ecf3]">
					{leads.map((lead) => (
						<TableRow
							className="odd:bg-[#f8fafc]/40 hover:bg-[#f8fafc]/80"
							key={lead.id}
						>
							<TableCell className="px-4">
								<div className="space-y-1">
									<p className="font-medium text-[#1b2430]">
										Lead {formatShortId(lead.id)}
									</p>
									<p className="text-xs text-[#6b7687]">
										Identificador completo: {lead.id}
									</p>
								</div>
							</TableCell>
							<TableCell>
								<Badge
									className="rounded-md border px-2.5 py-1 text-[0.72rem] font-medium"
									variant="outline"
								>
									{formatLeadSourceLabel(lead.source)}
								</Badge>
							</TableCell>
							<TableCell>
								<Badge
									className="rounded-md px-2.5 py-1 text-[0.72rem] font-medium"
									variant={statusBadgeVariant(lead.status)}
								>
									{formatLeadStatusLabel(lead.status)}
								</Badge>
							</TableCell>
							<TableCell className="text-sm text-[#6b7687]">
								{customerLabelById?.[lead.customerId] ??
									`Cliente ${formatShortId(lead.customerId)}`}
							</TableCell>
							<TableCell className="text-sm text-[#6b7687]">
								{storeLabelById?.[lead.storeId] ??
									`Loja ${formatShortId(lead.storeId)}`}
							</TableCell>
							<TableCell className="text-sm text-[#6b7687]">
								{lead.ownerUserId
									? (ownerLabelById?.[lead.ownerUserId] ??
										`Usuário ${formatShortId(lead.ownerUserId)}`)
									: 'Sem responsável'}
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
											<span className="sr-only">Ações do lead</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="w-44 rounded-xl bg-white"
									>
										{onEdit ? (
											<DropdownMenuItem
												className="cursor-pointer rounded-lg px-3 py-2 text-[#1b2430] hover:!bg-[#d96c3f]/10 hover:!text-[#D96C3F]"
												onSelect={() => onEdit(lead)}
											>
												<PencilLine className="size-4" />
												Editar
											</DropdownMenuItem>
										) : null}
										{onReassign ? (
											<DropdownMenuItem
												className="cursor-pointer rounded-lg px-3 py-2 text-[#1b2430] hover:!bg-[#d96c3f]/10 hover:!text-[#D96C3F]"
												onSelect={() => onReassign(lead)}
											>
												<Shuffle className="size-4" />
												Reatribuir
											</DropdownMenuItem>
										) : null}
										{onConvert && lead.status !== 'CONVERTED' ? (
											<DropdownMenuItem
												className="cursor-pointer rounded-lg px-3 py-2 text-[#1b2430] hover:!bg-[#d96c3f]/10 hover:!text-[#D96C3F]"
												onSelect={() => onConvert(lead)}
											>
												<CheckCheck className="size-4" />
												Converter
											</DropdownMenuItem>
										) : null}
										{onDelete ? (
											<DropdownMenuItem
												className="cursor-pointer rounded-lg px-3 py-2"
												onSelect={() => onDelete(lead)}
												variant="destructive"
											>
												<Trash2 className="size-4" />
												Excluir
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

export { LeadsTable };
