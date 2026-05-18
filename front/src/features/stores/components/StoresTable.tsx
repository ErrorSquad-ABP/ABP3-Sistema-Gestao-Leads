'use client';

import { Edit3, MapPin, MoreHorizontal, Trash2 } from 'lucide-react';

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

import type { StoreRecord } from '../model/stores.model';
import type { StoreTableRow } from '../lib/store-catalog-view';

type StoresTableProps = {
	canManageStores: boolean;
	onDelete: (store: StoreRecord) => void;
	onEdit: (store: StoreRecord) => void;
	rows: StoreTableRow[];
};

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
						<TableHead className="h-10 w-[220px] text-xs text-[#1f2a44]">
							Loja
						</TableHead>
						<TableHead className="h-10 text-xs text-[#1f2a44]">
							Resumo / Escopo comercial
						</TableHead>
						<TableHead className="h-10 w-[160px] text-xs text-[#1f2a44]">
							Status
						</TableHead>
						<TableHead className="h-10 w-[100px] text-right text-xs text-[#1f2a44]">
							Ações
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row) => (
						<TableRow className="border-[#e6ecf3]" key={row.store.id}>
							<TableCell className="py-3">
								<div className="flex items-center gap-3">
									<div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#ffddd2] bg-[#fff3ee] text-xs font-semibold text-[#f4511e]">
										{row.initials}
									</div>
									<div>
										<p className="text-sm font-semibold text-[#101828]">
											{row.store.name}
										</p>
										<p className="text-xs text-[#667085]">
											{row.leadCount} leads vinculados
										</p>
									</div>
								</div>
							</TableCell>
							<TableCell className="py-3">
								<div className="space-y-1.5">
									<div className="flex items-center gap-2 text-xs font-semibold text-[#1f2a44]">
										<MapPin className="size-3.5 text-[#667085]" />
										{row.region}
									</div>
									<p className="max-w-xl text-xs leading-5 text-[#667085]">
										{row.scope}
									</p>
								</div>
							</TableCell>
							<TableCell className="py-3">
								<div className="space-y-1.5">
									<span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfae6] px-2.5 py-0.5 text-[11px] font-semibold text-[#079455]">
										<span className="size-1.5 rounded-full bg-[#12b76a]" />
										Ativa
									</span>
									<p className="text-xs text-[#667085]">
										Cobertura {row.state}
									</p>
								</div>
							</TableCell>
							<TableCell className="py-3">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											aria-label={`Abrir ações da loja ${row.store.name}`}
											className="ml-auto flex size-9 rounded-full border-[#d8e0ea] bg-white shadow-sm"
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
