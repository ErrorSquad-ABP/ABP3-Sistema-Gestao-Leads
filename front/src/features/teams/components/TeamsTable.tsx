'use client';

import { Edit3, MoreHorizontal, Trash2, UsersRound } from 'lucide-react';

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

import type { TeamRecord } from '../model/teams.model';

type TeamTableRow = {
	colorClass: string;
	initials: string;
	leadCount: number | null;
	managerEmail: string | null;
	managerInitials: string;
	managerName: string;
	memberCount: number;
	openDealsCount: number | null;
	storeName: string;
	team: TeamRecord;
	conversionRate: number;
};

type TeamsTableProps = {
	onDelete: (team: TeamRecord) => void;
	onEdit: (team: TeamRecord) => void;
	onMembers: (team: TeamRecord) => void;
	rows: TeamTableRow[];
};

function formatCount(value: number) {
	return Math.round(value).toLocaleString('pt-BR');
}

function TeamsTable({ onDelete, onEdit, onMembers, rows }: TeamsTableProps) {
	return (
		<div className="overflow-hidden rounded-2xl border border-[#e6ecf3] bg-white">
			<Table>
				<TableHeader className="bg-[color:var(--table-header-bg)]">
					<TableRow className="border-border hover:bg-transparent">
						<TableHead className="h-10 min-w-[190px] text-xs text-[#1f2a44]">
							Equipe
						</TableHead>
						<TableHead className="h-10 min-w-[155px] text-xs text-[#1f2a44]">
							Loja
						</TableHead>
						<TableHead className="h-10 min-w-[170px] text-xs text-[#1f2a44]">
							Gerente
						</TableHead>
						<TableHead className="h-10 min-w-[150px] text-xs text-[#1f2a44]">
							Membros
						</TableHead>
						<TableHead className="h-10 min-w-[90px] text-xs text-[#1f2a44]">
							Leads
						</TableHead>
						<TableHead className="h-10 min-w-[120px] text-xs text-[#1f2a44]">
							Negociações abertas
						</TableHead>
						<TableHead className="h-10 min-w-[95px] text-xs text-[#1f2a44]">
							Conversão
						</TableHead>
						<TableHead className="h-10 w-[80px] text-right text-xs text-[#1f2a44]">
							Ações
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody className="table-zebra-body">
					{rows.map((row) => (
						<TableRow
							className="border-border hover:bg-[color:var(--table-row-hover)]"
							key={row.team.id}
						>
							<TableCell className="py-3">
								<div className="flex items-center gap-3">
									<div
										className={`flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f8fafc] text-xs font-bold ${row.colorClass}`}
									>
										{row.initials}
									</div>
									<div>
										<p className="text-sm font-bold text-[#101828]">
											{row.team.name}
										</p>
									</div>
								</div>
							</TableCell>
							<TableCell className="py-3">
								<p className="text-xs font-semibold text-[#1f2a44]">
									{row.storeName}
								</p>
							</TableCell>
							<TableCell className="py-3">
								<div className="flex items-center gap-2.5">
									<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eef2f6] text-[11px] font-bold text-[#667085]">
										{row.managerInitials}
									</div>
									<div className="min-w-0">
										<p className="truncate text-xs font-bold text-[#101828]">
											{row.managerName}
										</p>
										<p className="truncate text-[11px] text-[#667085]">
											{row.managerEmail ?? 'Sem gerente definido'}
										</p>
									</div>
								</div>
							</TableCell>
							<TableCell className="py-3">
								<div className="space-y-1">
									<p className="text-xs font-bold text-[#101828]">
										{formatCount(row.memberCount)}
									</p>
									<Button
										className="h-7 rounded-lg px-2 text-[11px] text-[color:var(--brand-accent-hover)] hover:bg-[color:var(--brand-accent-soft)]"
										onClick={() => onMembers(row.team)}
										size="sm"
										type="button"
										variant="ghost"
									>
										<UsersRound className="size-3.5" />
										Ver membros
									</Button>
								</div>
							</TableCell>
							<TableCell className="py-3">
								<p className="text-xs font-bold text-[#101828]">
									{row.leadCount === null ? '...' : formatCount(row.leadCount)}
								</p>
								<p className="text-[11px] text-[#079455]">atribuídos</p>
							</TableCell>
							<TableCell className="py-3">
								<p className="text-xs font-bold text-[#101828]">
									{row.openDealsCount === null
										? '...'
										: formatCount(row.openDealsCount)}
								</p>
								<p className="text-[11px] text-[#667085]">em negociação</p>
							</TableCell>
							<TableCell className="py-3">
								<span
									className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
										row.conversionRate >= 25
											? 'bg-[#dcfae6] text-[#079455]'
											: row.conversionRate >= 20
												? 'bg-[#fff3ee] text-[#f4511e]'
												: 'bg-[#eef2f6] text-[#667085]'
									}`}
								>
									{row.conversionRate}%
								</span>
							</TableCell>
							<TableCell className="py-3">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											aria-label={`Abrir ações da equipe ${row.team.name}`}
											className="ml-auto flex size-8 rounded-lg border-[#d8e0ea] bg-white shadow-sm"
											size="icon"
											variant="outline"
										>
											<MoreHorizontal className="size-3.5" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="w-40 rounded-xl bg-white"
									>
										<DropdownMenuItem onSelect={() => onEdit(row.team)}>
											<Edit3 className="mr-2 size-4" />
											Editar
										</DropdownMenuItem>
										<DropdownMenuItem
											className="text-destructive focus:text-destructive"
											onSelect={() => onDelete(row.team)}
										>
											<Trash2 className="mr-2 size-4" />
											Excluir
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

export { TeamsTable };
export type { TeamTableRow };
