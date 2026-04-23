'use client';

import { Eye, MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';

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
	formatDealImportanceLabel,
	formatDealStageLabel,
	formatDealStatusLabel,
	formatDealValueBRL,
} from '../lib/deal-labels';
import type { Deal } from '../model/deals.model';

type DealsTableProps = {
	deals: Deal[];
	/** Só passar quando a vista tem pelo menos uma linha mutável; o menu continua a filtrar com `deal.canMutate` por negociação. */
	onDelete?: (deal: Deal) => void;
	onEdit?: (deal: Deal) => void;
	onOpenDetails?: (deal: Deal) => void;
};

function DealsTable({
	deals,
	onDelete,
	onEdit,
	onOpenDetails,
}: DealsTableProps) {
	if (deals.length === 0) {
		return (
			<div className="rounded-2xl border border-border/80 bg-card px-4 py-10 text-center text-sm text-[#6b7687]">
				Nenhuma negociação encontrada.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
			<Table>
				<TableHeader className="[&_tr]:border-[#e6ecf3]">
					<TableRow className="bg-[#f8fafc] hover:bg-[#f8fafc]">
						<TableHead>Status</TableHead>
						<TableHead>Etapa</TableHead>
						<TableHead>Importância</TableHead>
						<TableHead>Título</TableHead>
						<TableHead>Valor</TableHead>
						<TableHead>Lead</TableHead>
						<TableHead>Veículo</TableHead>
						<TableHead className="w-18 text-right">Ações</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody className="[&_tr]:border-[#e6ecf3]">
					{deals.map((deal) => (
						<TableRow
							className="odd:bg-[#f8fafc]/40 hover:bg-[#f8fafc]/80"
							key={deal.id}
							onDoubleClick={() => onOpenDetails?.(deal)}
						>
							<TableCell>
								<Badge
									className="rounded-md px-2.5 py-1 text-[0.72rem] font-medium"
									variant="outline"
								>
									{formatDealStatusLabel(deal.status)}
								</Badge>
							</TableCell>
							<TableCell className="text-sm text-[#6b7687]">
								{formatDealStageLabel(deal.stage)}
							</TableCell>
							<TableCell className="text-sm text-[#6b7687]">
								{formatDealImportanceLabel(deal.importance)}
							</TableCell>
							<TableCell>
								<p className="font-medium text-[#1b2430]">{deal.title}</p>
							</TableCell>
							<TableCell className="text-sm text-[#6b7687]">
								{formatDealValueBRL(deal.value)}
							</TableCell>
							<TableCell className="text-sm text-[#6b7687]">
								{deal.leadCustomerName || 'Cliente não encontrado'}
							</TableCell>
							<TableCell className="text-sm text-[#6b7687]">
								{deal.vehicleLabel || 'Veículo não encontrado'}
							</TableCell>
							<TableCell className="text-right">
								<DropdownMenu>
									<DropdownMenuTrigger
										asChild
										disabled={
											!onOpenDetails &&
											!((onEdit || onDelete) && deal.canMutate)
										}
									>
										<Button
											className="rounded-md"
											size="icon-sm"
											variant="ghost"
										>
											<MoreHorizontal className="size-4" />
											<span className="sr-only">Ações da negociação</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="w-44 rounded-xl bg-white"
									>
										{onOpenDetails ? (
											<DropdownMenuItem
												className="cursor-pointer rounded-lg px-3 py-2 text-[#1b2430] hover:bg-[#d96c3f]/10! hover:text-[#D96C3F]!"
												onSelect={() => onOpenDetails(deal)}
											>
												<Eye className="size-4" />
												Detalhes
											</DropdownMenuItem>
										) : null}
										{onEdit && deal.canMutate ? (
											<DropdownMenuItem
												className="cursor-pointer rounded-lg px-3 py-2 text-[#1b2430] hover:bg-[#d96c3f]/10! hover:text-[#D96C3F]!"
												onSelect={() => onEdit(deal)}
											>
												<PencilLine className="size-4" />
												Editar
											</DropdownMenuItem>
										) : null}
										{onDelete && deal.canMutate ? (
											<DropdownMenuItem
												className="cursor-pointer rounded-lg px-3 py-2"
												onSelect={() => onDelete(deal)}
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

export { DealsTable };
