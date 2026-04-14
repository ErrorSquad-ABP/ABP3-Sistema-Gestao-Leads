'use client';

import { MoreHorizontal } from 'lucide-react';

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
	leads: LeadListItem[];
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

function LeadsTable({ leads }: LeadsTableProps) {
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
								Cliente {formatShortId(lead.customerId)}
							</TableCell>
							<TableCell className="text-sm text-[#6b7687]">
								Loja {formatShortId(lead.storeId)}
							</TableCell>
							<TableCell className="text-sm text-[#6b7687]">
								{lead.ownerUserId
									? `Usuário ${formatShortId(lead.ownerUserId)}`
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
										<DropdownMenuItem className="cursor-default rounded-lg px-3 py-2 text-[#6b7687]">
											Detalhamento em breve
										</DropdownMenuItem>
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
