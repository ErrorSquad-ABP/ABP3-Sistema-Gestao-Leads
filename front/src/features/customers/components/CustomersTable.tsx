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

import type { CustomerCatalogItem } from '../model/customers.model';

type CustomersTableProps = {
	readonly items: CustomerCatalogItem[];
	readonly onDelete: (item: CustomerCatalogItem) => void;
	readonly onEdit: (item: CustomerCatalogItem) => void;
	readonly onView: (item: CustomerCatalogItem) => void;
};

function formatCustomerInitials(name: string) {
	const words = name.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) {
		return 'CL';
	}
	const [first = '', second = ''] = words;
	return `${first[0] ?? ''}${second[0] ?? first[1] ?? ''}`.toUpperCase();
}

function formatCurrency(value: string) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return 'R$ 0';
	}
	return parsed.toLocaleString('pt-BR', {
		currency: 'BRL',
		maximumFractionDigits: 0,
		style: 'currency',
	});
}

function formatActivityDate(value: Date | null) {
	if (!value) {
		return 'Sem atividade';
	}

	const diffMs = Date.now() - value.getTime();
	const diffDays = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
	if (diffDays === 0) {
		return `Hoje às ${value.toLocaleTimeString('pt-BR', {
			hour: '2-digit',
			minute: '2-digit',
		})}`;
	}
	if (diffDays === 1) {
		return `Ontem às ${value.toLocaleTimeString('pt-BR', {
			hour: '2-digit',
			minute: '2-digit',
		})}`;
	}
	return `${diffDays} dias atrás`;
}

function formatDealSummary(item: CustomerCatalogItem) {
	if (item.totalDealsCount === 0) {
		return '0';
	}
	if (item.wonDealsCount > 0 && item.openDealsCount === 0) {
		return `${item.wonDealsCount} ${item.wonDealsCount === 1 ? 'ganha' : 'ganhas'}`;
	}
	return `${item.openDealsCount} ${item.openDealsCount === 1 ? 'aberta' : 'abertas'}`;
}

function CustomersTable({
	items,
	onDelete,
	onEdit,
	onView,
}: CustomersTableProps) {
	return (
		<div className="overflow-hidden rounded-b-3xl border-t border-border">
			<Table>
				<TableHeader className="bg-[color:var(--table-header-bg)]">
					<TableRow className="border-border hover:bg-transparent">
						<TableHead className="w-[22%] pl-7 text-foreground">
							Cliente
						</TableHead>
						<TableHead className="w-[18%] text-foreground">Contato</TableHead>
						<TableHead className="w-[13%] text-foreground">Documento</TableHead>
						<TableHead className="w-[13%] text-foreground">
							Negociações
						</TableHead>
						<TableHead className="w-[16%] text-foreground">
							Última atividade
						</TableHead>
						<TableHead className="w-[10%] text-foreground">Status</TableHead>
						<TableHead className="pr-6 text-right text-foreground">
							Ações
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody className="[&_tr:nth-child(even)]:bg-[color:var(--table-row-alt)]">
					{items.length === 0 ? (
						<TableRow className="border-border">
							<TableCell
								className="py-10 text-center text-sm text-muted-foreground"
								colSpan={7}
							>
								Nenhum cliente encontrado.
							</TableCell>
						</TableRow>
					) : (
						items.map((item) => (
							<TableRow
								className="h-[4.35rem] border-border hover:bg-[color:var(--table-row-hover)]"
								key={item.customer.id}
							>
								<TableCell className="pl-7">
									<div className="flex items-center gap-3">
										<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
											{formatCustomerInitials(item.customer.name)}
										</div>
										<p className="font-semibold text-foreground">
											{item.customer.name}
										</p>
									</div>
								</TableCell>
								<TableCell>
									<p className="text-sm font-medium text-foreground">
										{item.customer.email ?? 'Sem e-mail'}
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{item.customer.phone ?? 'Sem telefone'}
									</p>
								</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									{item.customer.cpf ?? '---'}
								</TableCell>
								<TableCell>
									<p
										className={
											item.wonDealsCount > 0
												? 'text-sm font-semibold text-[color:var(--text-positive)]'
												: 'text-sm font-semibold text-foreground'
										}
									>
										{formatDealSummary(item)}
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{item.totalDealsCount > 0
											? formatCurrency(item.totalDealValue)
											: 'Sem negociações'}
									</p>
								</TableCell>
								<TableCell>
									<p className="text-sm font-medium text-foreground">
										{formatActivityDate(item.lastActivityAt)}
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{item.lastActivityLabel}
									</p>
								</TableCell>
								<TableCell>
									<Badge
										className={
											item.status === 'ACTIVE'
												? 'gap-1.5 rounded-full border-emerald-100 bg-[color:var(--kpi-surface-success)] px-3 py-1 text-[color:var(--text-positive)]'
												: 'gap-1.5 rounded-full border-slate-100 bg-slate-100 px-3 py-1 text-slate-600'
										}
									>
										<span
											className={
												item.status === 'ACTIVE'
													? 'size-1.5 rounded-full bg-[color:var(--text-positive)]'
													: 'size-1.5 rounded-full bg-slate-400'
											}
										/>
										{item.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
									</Badge>
								</TableCell>
								<TableCell className="pr-6">
									<div className="flex justify-end gap-2">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													className="rounded-lg border-border shadow-none"
													size="icon-sm"
													variant="outline"
												>
													<MoreHorizontal className="size-4" />
													<span className="sr-only">Mais ações</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												className="w-44 rounded-xl bg-card"
											>
												<DropdownMenuItem
													className="cursor-pointer rounded-lg px-3 py-2"
													onSelect={() => onView(item)}
												>
													<Eye className="size-4" />
													Detalhes
												</DropdownMenuItem>
												<DropdownMenuItem
													className="cursor-pointer rounded-lg px-3 py-2"
													onSelect={() => onEdit(item)}
												>
													<PencilLine className="size-4" />
													Editar
												</DropdownMenuItem>
												<DropdownMenuItem
													className="cursor-pointer rounded-lg px-3 py-2"
													onSelect={() => onDelete(item)}
													variant="destructive"
												>
													<Trash2 className="size-4" />
													Excluir
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}

export { CustomersTable, formatCurrency };
