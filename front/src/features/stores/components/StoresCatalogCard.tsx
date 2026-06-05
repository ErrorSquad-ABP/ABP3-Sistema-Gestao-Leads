'use client';

import { TablePagination } from '@/components/data/TablePagination';
import { Card, CardContent } from '@/components/ui/card';

import { STORE_PAGE_SIZE_OPTIONS, type StoreTableRow } from '../lib/store-view';
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
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
	page: number;
	pageSize: number;
	rows: StoreTableRow[];
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
	onPageSizeChange,
	page,
	pageSize,
	rows,
	totalPages,
}: StoresCatalogCardProps) {
	return (
		<Card className="rounded-2xl border-[#dfe7f1] bg-white shadow-sm">
			<CardContent className="space-y-4 p-5">
				<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-2">
						<h2 className="text-base font-bold text-[#101828]">
							Lista de lojas
						</h2>
						<span className="rounded-full bg-[#f2f4f7] px-2 py-0.5 text-[11px] font-medium text-[#667085]">
							{filteredCount} lojas cadastradas
						</span>
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

				<TablePagination
					className="px-0 pb-0"
					isLoading={isLoading}
					itemLabel="lojas"
					onPageChange={onPageChange}
					onPageSizeChange={onPageSizeChange}
					page={page}
					pageSize={pageSize}
					pageSizeOptions={STORE_PAGE_SIZE_OPTIONS}
					totalItems={filteredCount}
					totalPages={totalPages}
				/>

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
