'use client';

import { Building2, Edit3, MoreHorizontal, Trash2 } from 'lucide-react';

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

import type { StoreTableRow } from '../lib/store-catalog-view';
import type { StoreRecord } from '../model/stores.model';

type StoresTableProps = {
	canManageStores: boolean;
	onDelete: (store: StoreRecord) => void;
	onEdit: (store: StoreRecord) => void;
	rows: StoreTableRow[];
};

function formatCount(value: number) {
	return Math.round(value).toLocaleString('pt-BR');
}

function getTeamLabel(count: number) {
	if (count === 1) {
		return '1 equipe';
	}
	return `${count} equipes`;
}

function StoresTable({
	canManageStores,
	onDelete,
	onEdit,
	rows,
}: StoresTableProps) {
	return (
		<div className="overflow-hidden rounded-2xl border border-[#e6ecf3] bg-white">
			<Table>
				<TableHeader className="bg-[#f8fafc]/80">
					<TableRow className="border-[#e6ecf3]">
						<TableHead className="h-10 min-w-[180px] text-xs text-[#1f2a44]">
							Loja
						</TableHead>
						<TableHead className="h-10 min-w-[190px] text-xs text-[#1f2a44]">
							Cidade / Estado
						</TableHead>
						<TableHead className="h-10 min-w-[170px] text-xs text-[#1f2a44]">
							Responsável
						</TableHead>
						<TableHead className="h-10 min-w-[110px] text-xs text-[#1f2a44]">
							Lojas/Equipes
						</TableHead>
						<TableHead className="h-10 min-w-[100px] text-xs text-[#1f2a44]">
							Leads
						</TableHead>
						<TableHead className="h-10 min-w-[130px] text-xs text-[#1f2a44]">
							Negociações abertas
						</TableHead>
						<TableHead className="h-10 min-w-[100px] text-xs text-[#1f2a44]">
							Conversão
						</TableHead>
						<TableHead className="h-10 min-w-[90px] text-xs text-[#1f2a44]">
							Status
						</TableHead>
						<TableHead className="h-10 w-[80px] text-right text-xs text-[#1f2a44]">
							Ações
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row) => (
						<TableRow className="border-[#e6ecf3]" key={row.store.id}>
							<TableCell className="py-3">
								<div className="flex items-center gap-3">
									<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#667085]">
										<Building2 className="size-4" />
									</div>
									<p className="text-sm font-bold text-[#101828]">
										{row.store.name}
									</p>
								</div>
							</TableCell>
							<TableCell className="py-3">
								<div className="space-y-0.5">
									<p className="text-xs font-medium text-[#1f2a44]">
										{row.addressLine}
									</p>
									<p className="text-xs text-[#667085]">{row.cityState}</p>
								</div>
							</TableCell>
							<TableCell className="py-3">
								<div className="flex items-center gap-2.5">
									<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eef2f6] text-[11px] font-bold text-[#667085]">
										{row.ownerInitials}
									</div>
									<div className="min-w-0">
										<p className="truncate text-xs font-bold text-[#101828]">
											{row.ownerName}
										</p>
										<p className="truncate text-[11px] text-[#667085]">
											{row.ownerEmail ?? 'Gerente'}
										</p>
									</div>
								</div>
							</TableCell>
							<TableCell className="py-3 text-xs text-[#1f2a44]">
								{getTeamLabel(row.teamCount)}
							</TableCell>
							<TableCell className="py-3">
								<p className="text-xs font-bold text-[#101828]">
									{formatCount(row.leadCount)}
								</p>
								<p className="text-[11px] text-[#079455]">
									{formatCount(row.convertedLeadCount)} convertidos
								</p>
							</TableCell>
							<TableCell className="py-3">
								<p className="text-xs font-bold text-[#101828]">
									{formatCount(row.openDealsCount)}
								</p>
								<p className="text-[11px] text-[#667085]">em andamento</p>
							</TableCell>
							<TableCell className="py-3">
								<p className="text-xs font-bold text-[#101828]">
									{row.conversionRate}%
								</p>
								<p className="text-[11px] text-[#079455]">conversão</p>
							</TableCell>
							<TableCell className="py-3">
								<span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfae6] px-2.5 py-1 text-[11px] font-semibold text-[#079455]">
									<span className="size-1.5 rounded-full bg-[#12b76a]" />
									Ativa
								</span>
							</TableCell>
							<TableCell className="py-3">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											aria-label={`Abrir ações da loja ${row.store.name}`}
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
										<DropdownMenuItem
											disabled={!canManageStores}
											onSelect={() => onEdit(row.store)}
										>
											<Edit3 className="mr-2 size-4" />
											Editar
										</DropdownMenuItem>
										<DropdownMenuItem
											className="text-destructive focus:text-destructive"
											disabled={!canManageStores}
											onSelect={() => onDelete(row.store)}
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

export { StoresTable };
