'use client';

import {
	ChevronLeft,
	ChevronRight,
	Eye,
	MoreHorizontal,
	PencilLine,
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

import type { CustomerCatalogItem } from '../model/customers.model';

type CustomersTableProps = {
	currentPage: number;
	items: CustomerCatalogItem[];
	onDelete: (item: CustomerCatalogItem) => void;
	onEdit: (item: CustomerCatalogItem) => void;
	onNextPage: () => void;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: 6 | 12 | 18 | 24 | 48) => void;
	onPreviousPage: () => void;
	onView: (item: CustomerCatalogItem) => void;
	pageSize: number;
	pageSizeOptions: readonly (6 | 12 | 18 | 24 | 48)[];
	totalItems: number;
	totalPages: number;
};

type PaginationItem = number | 'ellipsis';

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

function buildPaginationItems(
	currentPage: number,
	totalPages: number,
): PaginationItem[] {
	if (totalPages <= 5) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	const leadingPages = [1, 2, 3, 4];
	if (currentPage <= 4) {
		return [...leadingPages, 'ellipsis', totalPages];
	}

	if (currentPage >= totalPages - 2) {
		return [
			1,
			'ellipsis',
			totalPages - 3,
			totalPages - 2,
			totalPages - 1,
			totalPages,
		];
	}

	return [
		1,
		'ellipsis',
		currentPage - 1,
		currentPage,
		currentPage + 1,
		'ellipsis',
		totalPages,
	];
}

function CustomersTable({
	currentPage,
	items,
	onDelete,
	onEdit,
	onNextPage,
	onPageChange,
	onPageSizeChange,
	onPreviousPage,
	onView,
	pageSize,
	pageSizeOptions,
	totalItems,
	totalPages,
}: CustomersTableProps) {
	const paginationItems = buildPaginationItems(currentPage, totalPages);
	const firstVisibleItem =
		items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	const lastVisibleItem = Math.min(currentPage * pageSize, totalItems);

	return (
		<div className="overflow-hidden rounded-b-3xl border-t border-[#e7edf5]">
			<Table>
				<TableHeader className="bg-white">
					<TableRow className="border-[#e7edf5]">
						<TableHead className="w-[22%] pl-7 text-[#1e293b]">
							Cliente
						</TableHead>
						<TableHead className="w-[18%] text-[#1e293b]">Contato</TableHead>
						<TableHead className="w-[13%] text-[#1e293b]">Documento</TableHead>
						<TableHead className="w-[13%] text-[#1e293b]">
							Negociações
						</TableHead>
						<TableHead className="w-[16%] text-[#1e293b]">
							Última atividade
						</TableHead>
						<TableHead className="w-[10%] text-[#1e293b]">Status</TableHead>
						<TableHead className="pr-6 text-right text-[#1e293b]">
							Ações
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.length === 0 ? (
						<TableRow className="border-[#e7edf5]">
							<TableCell
								className="py-10 text-center text-sm text-[#667085]"
								colSpan={7}
							>
								Nenhum cliente encontrado.
							</TableCell>
						</TableRow>
					) : (
						items.map((item) => (
							<TableRow
								className="h-[4.35rem] border-[#e7edf5] hover:bg-[#f8fafc]/80"
								key={item.customer.id}
							>
								<TableCell className="pl-7">
									<div className="flex items-center gap-3">
										<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f1f4f8] text-xs font-semibold text-[#667085]">
											{formatCustomerInitials(item.customer.name)}
										</div>
										<p className="font-semibold text-[#101828]">
											{item.customer.name}
										</p>
									</div>
								</TableCell>
								<TableCell>
									<p className="text-sm font-medium text-[#1e293b]">
										{item.customer.email ?? 'Sem e-mail'}
									</p>
									<p className="mt-1 text-xs text-[#667085]">
										{item.customer.phone ?? 'Sem telefone'}
									</p>
								</TableCell>
								<TableCell className="text-sm text-[#667085]">
									{item.customer.cpf ?? '---'}
								</TableCell>
								<TableCell>
									<p
										className={
											item.wonDealsCount > 0
												? 'text-sm font-semibold text-emerald-600'
												: 'text-sm font-semibold text-[#1e293b]'
										}
									>
										{formatDealSummary(item)}
									</p>
									<p className="mt-1 text-xs text-[#667085]">
										{item.totalDealsCount > 0
											? formatCurrency(item.totalDealValue)
											: 'Sem negociações'}
									</p>
								</TableCell>
								<TableCell>
									<p className="text-sm font-medium text-[#1e293b]">
										{formatActivityDate(item.lastActivityAt)}
									</p>
									<p className="mt-1 text-xs text-[#667085]">
										{item.lastActivityLabel}
									</p>
								</TableCell>
								<TableCell>
									<Badge
										className={
											item.status === 'ACTIVE'
												? 'gap-1.5 rounded-full border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-700'
												: 'gap-1.5 rounded-full border-slate-100 bg-slate-100 px-3 py-1 text-slate-600'
										}
									>
										<span
											className={
												item.status === 'ACTIVE'
													? 'size-1.5 rounded-full bg-emerald-500'
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
													className="rounded-lg border-[#d8e0ea] shadow-none"
													size="icon-sm"
													variant="outline"
												>
													<MoreHorizontal className="size-4" />
													<span className="sr-only">Mais ações</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												className="w-44 rounded-xl bg-white"
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

			<div className="grid gap-3 border-t border-[#e7edf5] px-7 py-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
				<p className="text-sm text-[#667085]">
					Mostrando {firstVisibleItem} a {lastVisibleItem} de {totalItems}{' '}
					clientes
				</p>
				<div className="flex items-center justify-center gap-2">
					<Button
						className="rounded-lg border-[#d8e0ea]"
						disabled={currentPage <= 1}
						onClick={onPreviousPage}
						size="icon-sm"
						variant="outline"
					>
						<ChevronLeft className="size-4" />
					</Button>
					{paginationItems.map((item, index) =>
						item === 'ellipsis' ? (
							<span
								className="px-2 text-sm font-semibold text-[#667085]"
								key={`ellipsis-${index}`}
							>
								...
							</span>
						) : (
							<Button
								className={
									item === currentPage
										? 'min-w-9 rounded-lg bg-orange-50 px-3 text-sm font-semibold text-[#f05a28] shadow-none hover:bg-orange-50'
										: 'min-w-9 rounded-lg px-3 text-sm font-semibold text-[#1e293b] shadow-none hover:bg-[#f8fafc]'
								}
								key={item}
								onClick={() => onPageChange(item)}
								variant="ghost"
							>
								{item}
							</Button>
						),
					)}
					<Button
						className="rounded-lg border-[#d8e0ea]"
						disabled={currentPage >= totalPages}
						onClick={onNextPage}
						size="icon-sm"
						variant="outline"
					>
						<ChevronRight className="size-4" />
					</Button>
				</div>
				<label className="flex items-center justify-start gap-2 text-sm text-[#667085] lg:justify-end">
					Itens por página:
					<select
						className="h-9 rounded-lg border border-[#d8e0ea] bg-white px-3 text-sm font-semibold text-[#1e293b] outline-none"
						onChange={(event) =>
							onPageSizeChange(
								Number(event.target.value) as 6 | 12 | 18 | 24 | 48,
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
				</label>
			</div>
		</div>
	);
}

export { CustomersTable, formatCurrency };
