"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { STORES_PAGE_SIZE, type StoreTableRow } from "../lib/store-catalog-view"
import type { StoreRecord } from "../model/stores.model"
import { StoresTable } from "./StoresTable"

type StoresCatalogCardProps = {
	canManageStores: boolean
	errorMessage: string | null
	filteredCount: number
	isError: boolean
	isLoading: boolean
	onDelete: (store: StoreRecord) => void
	onEdit: (store: StoreRecord) => void
	onPageChange: (page: number | ((current: number) => number)) => void
	page: number
	rows: StoreTableRow[]
	totalPages: number
}

function StoresCatalogCard({
	canManageStores,
	errorMessage,
	filteredCount,
	isError,
	isLoading,
	onDelete,
	onEdit,
	onPageChange,
	page,
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

				<div className="grid items-center gap-3 text-xs text-[#667085] md:grid-cols-[1fr_auto_1fr]">
					<span>
						Exibindo {rows.length === 0 ? 0 : (page - 1) * STORES_PAGE_SIZE + 1}{" "}
						a {Math.min(page * STORES_PAGE_SIZE, filteredCount)} de{" "}
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
					<span className="text-right">
						Itens por página: {STORES_PAGE_SIZE}
					</span>
				</div>

				{!canManageStores ? (
					<p className="text-xs text-muted-foreground">
						A gestão de lojas está disponível apenas para administrador e
						gerente geral.
					</p>
				) : null}
			</CardContent>
		</Card>
	)
}

export { StoresCatalogCard }
