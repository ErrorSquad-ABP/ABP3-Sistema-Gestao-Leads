'use client';

import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import {
	STORES_PAGE_SIZE,
	type StoreTableRow,
} from '../lib/store-catalog-view';
import type { StoreRecord } from '../model/stores.model';
import { StoresTable } from './StoresTable';

type StoresCatalogCardProps = {
	canManageStores: boolean;
	errorMessage: string | null;
	filteredCount: number;
	isError: boolean;
	isLoading: boolean;
	onDelete: (store: StoreRecord) => void;
	onEdit: (store: StoreRecord) => void;
	onPageChange: (page: number | ((current: number) => number)) => void;
	onRegionFilterChange: (value: string) => void;
	onSearchChange: (value: string) => void;
	page: number;
	regionFilter: string;
	regionOptions: Array<[string, string]>;
	rows: StoreTableRow[];
	search: string;
	totalPages: number;
};

function StoresCatalogCard({
	canManageStores,
	errorMessage,
	filteredCount,
	isError,
	isLoading,
	onDelete,
	onEdit,
	onPageChange,
	onRegionFilterChange,
	onSearchChange,
	page,
	regionFilter,
	regionOptions,
	rows,
	search,
	totalPages,
}: StoresCatalogCardProps) {
	return (
		<Card className="rounded-2xl border-[#dfe7f1] bg-white shadow-sm">
			<CardContent className="space-y-4 p-5">
				<div className="flex flex-col gap-3 2xl:flex-row 2xl:items-start 2xl:justify-between">
					<div className="space-y-1">
						<h2 className="text-lg font-bold text-[#101828]">
							Cadastro de lojas
						</h2>
						<p className="text-xs text-[#667085]">
							Gerencie suas lojas e defina o escopo comercial de cada operação.
						</p>
					</div>
					<div className="flex flex-col gap-3 lg:flex-row">
						<div className="relative">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3.5 size-4 text-[#667085]" />
							<Input
								className="h-11 rounded-xl border-[#d8e0ea] bg-white pr-4 pl-10 text-xs shadow-none lg:w-[310px]"
								onChange={(event) => onSearchChange(event.target.value)}
								placeholder="Buscar por loja ou região..."
								value={search}
							/>
						</div>
						<select
							className="h-11 rounded-xl border border-[#d8e0ea] bg-white px-4 text-xs text-[#101828] outline-none lg:w-[190px]"
							onChange={(event) => onRegionFilterChange(event.target.value)}
							value={regionFilter}
						>
							<option value="ALL">Todas as regiões</option>
							{regionOptions.map(([state, label]) => (
								<option key={state} value={state}>
									{label}
								</option>
							))}
						</select>
					</div>
				</div>

				{isLoading ? (
					<div className="rounded-2xl border border-border/80 bg-muted/20 px-4 py-8 text-sm text-muted-foreground">
						Carregando lojas...
					</div>
				) : isError ? (
					<div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
						{errorMessage}
					</div>
				) : (
					<StoresTable
						canManageStores={canManageStores}
						onDelete={onDelete}
						onEdit={onEdit}
						rows={rows}
					/>
				)}

				<div className="flex flex-col gap-3 text-xs text-[#667085] md:flex-row md:items-center md:justify-between">
					<span>
						Exibindo {rows.length === 0 ? 0 : (page - 1) * STORES_PAGE_SIZE + 1}{' '}
						a {Math.min(page * STORES_PAGE_SIZE, filteredCount)} de{' '}
						{filteredCount} lojas
					</span>
					<div className="flex items-center justify-center gap-2">
						<Button
							className="size-8 rounded-xl border-[#d8e0ea]"
							disabled={page <= 1}
							onClick={() =>
								onPageChange((current) => Math.max(1, current - 1))
							}
							size="icon"
							variant="outline"
						>
							<ChevronLeft className="size-3.5" />
						</Button>
						<span className="flex size-8 items-center justify-center rounded-xl border border-[#ffb199] bg-[#fff3ee] text-xs font-semibold text-[#f4511e]">
							{page}
						</span>
						<Button
							className="size-8 rounded-xl border-[#d8e0ea]"
							disabled={page >= totalPages}
							onClick={() =>
								onPageChange((current) => Math.min(totalPages, current + 1))
							}
							size="icon"
							variant="outline"
						>
							<ChevronRight className="size-3.5" />
						</Button>
					</div>
				</div>

				{!canManageStores ? (
					<p className="text-xs text-muted-foreground">
						A gestão de lojas está disponível apenas para administrador e
						gerente geral.
					</p>
				) : null}
			</CardContent>
		</Card>
	);
}

export { StoresCatalogCard };
