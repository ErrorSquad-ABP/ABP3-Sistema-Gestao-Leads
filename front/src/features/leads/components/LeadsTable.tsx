'use client';

import { Badge } from '@/components/ui/badge';
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
			<div className="rounded-none border border-border/75 bg-card px-4 py-10 text-center text-sm text-muted-foreground">
				Nenhum lead encontrado.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-none border border-border/75 bg-card">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>ID</TableHead>
						<TableHead>Cliente</TableHead>
						<TableHead>Loja</TableHead>
						<TableHead>Responsável</TableHead>
						<TableHead>Origem</TableHead>
						<TableHead>Estado</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{leads.map((lead) => (
						<TableRow key={lead.id}>
							<TableCell className="font-mono text-[0.7rem] text-muted-foreground">
								{formatShortId(lead.id)}
							</TableCell>
							<TableCell className="font-mono text-[0.7rem] text-muted-foreground">
								{formatShortId(lead.customerId)}
							</TableCell>
							<TableCell className="font-mono text-[0.7rem] text-muted-foreground">
								{formatShortId(lead.storeId)}
							</TableCell>
							<TableCell className="font-mono text-[0.7rem] text-muted-foreground">
								{lead.ownerUserId ? formatShortId(lead.ownerUserId) : '—'}
							</TableCell>
							<TableCell>
								<Badge variant="outline" className="font-normal">
									{formatLeadSourceLabel(lead.source)}
								</Badge>
							</TableCell>
							<TableCell>
								<Badge
									variant={statusBadgeVariant(lead.status)}
									className="font-normal"
								>
									{formatLeadStatusLabel(lead.status)}
								</Badge>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

export { LeadsTable };
