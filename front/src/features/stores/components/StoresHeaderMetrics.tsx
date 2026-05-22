"use client"

import {
	Building2,
	CheckCircle2,
	Download,
	Filter,
	Plus,
	Search,
	Tag,
	Trophy,
	UsersRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type MetricTone = "amber" | "blue" | "green" | "orange" | "purple"

type StoresPageHeaderProps = {
	canManageStores: boolean
	onCreate: () => void
	onExport: () => void
	onRegionFilterChange: (value: string) => void
	onSearchChange: (value: string) => void
	regionFilter: string
	regionOptions: Array<[string, string]>
	search: string
}

type StoresMetricsGridProps = {
	activeStores: number
	averageLeads: number
	averageConversionRate: number
	openDeals: number
	storesCount: number
	totalLeads: number
	uniqueStates: string[]
}

function getMetricToneClass(tone: MetricTone) {
	switch (tone) {
		case "amber":
			return "bg-[#fff7e6] text-[#f79009]"
		case "blue":
			return "bg-[#eff6ff] text-[#2563eb]"
		case "green":
			return "bg-[#ecfdf3] text-[#079455]"
		case "orange":
			return "bg-[#fff3ee] text-[#f4511e]"
		case "purple":
			return "bg-[#f4edff] text-[#7f35e8]"
	}
}

function StoreMetricCard({
	helper,
	icon: Icon,
	label,
	tone,
	value,
}: {
	helper: string
	icon: typeof Building2
	label: string
	tone: MetricTone
	value: string
}) {
	const toneClass = getMetricToneClass(tone)

	return (
		<Card className="rounded-2xl border-[#dfe7f1] bg-white shadow-sm">
			<CardContent className="flex min-h-28 items-center gap-4 p-5">
				<div
					className={`flex size-12 shrink-0 items-center justify-center rounded-full ${toneClass}`}
				>
					<Icon className="size-5" />
				</div>
				<div className="space-y-1">
					<p className="text-xs font-medium text-[#667085]">{label}</p>
					<p className="text-2xl font-bold tracking-tight text-[#101828]">
						{value}
					</p>
					<p className="text-xs text-[#667085]">{helper}</p>
				</div>
			</CardContent>
		</Card>
	)
}

function StoresPageHeader({
	canManageStores,
	onCreate,
	onExport,
	onRegionFilterChange,
	onSearchChange,
	regionFilter,
	regionOptions,
	search,
}: StoresPageHeaderProps) {
	return (
		<header className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight text-[#101828]">
					Gestão de lojas
				</h1>
				<p className="max-w-4xl text-sm text-[#667085]">
					Centralize todas as unidades do seu negócio e acompanhe seu
					desempenho.
				</p>
			</div>
			<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
				<div className="relative">
					<Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#667085]" />
					<Input
						className="h-11 rounded-xl border-[#d8e0ea] bg-white pr-4 pl-10 text-xs shadow-none lg:w-[340px]"
						onChange={(event) => onSearchChange(event.target.value)}
						placeholder="Buscar por nome, cidade ou responsável..."
						value={search}
					/>
				</div>
				<div className="relative">
					<Filter className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#1f2a44]" />
					<select
						className="h-11 appearance-none rounded-xl border border-[#d8e0ea] bg-white pr-8 pl-10 text-xs font-semibold text-[#1f2a44] outline-none"
						onChange={(event) => onRegionFilterChange(event.target.value)}
						value={regionFilter}
					>
						<option value="ALL">Filtros</option>
						{regionOptions.map(([state, label]) => (
							<option key={state} value={state}>
								{label}
							</option>
						))}
					</select>
				</div>
				<Button
					className="h-11 rounded-xl border-[#d8e0ea] px-5 text-xs font-semibold text-[#1f2a44]"
					onClick={onExport}
					type="button"
					variant="outline"
				>
					<Download className="size-4" />
					Exportar
				</Button>
				<Button
					className="h-11 rounded-xl bg-[#f4511e] px-5 text-sm text-white shadow-sm hover:bg-[#dc3f13]"
					disabled={!canManageStores}
					onClick={onCreate}
				>
					<Plus className="size-4" />
					Nova loja
				</Button>
			</div>
		</header>
	)
}

function StoresMetricsGrid({
	activeStores,
	averageLeads,
	averageConversionRate,
	openDeals,
	storesCount,
	totalLeads,
	uniqueStates,
}: StoresMetricsGridProps) {
	return (
		<div className="grid gap-4 xl:grid-cols-5">
			<StoreMetricCard
				helper="Unidades cadastradas"
				icon={Building2}
				label="Total de lojas"
				tone="blue"
				value={String(storesCount)}
			/>
			<StoreMetricCard
				helper={`${storesCount > 0 ? Math.round((activeStores / storesCount) * 100) : 0}% do total`}
				icon={CheckCircle2}
				label="Lojas ativas"
				tone="green"
				value={String(activeStores)}
			/>
			<StoreMetricCard
				helper={`${averageLeads} em média por loja`}
				icon={UsersRound}
				label="Leads no período"
				tone="orange"
				value={String(totalLeads)}
			/>
			<StoreMetricCard
				helper={
					uniqueStates.length > 0
						? `${uniqueStates.length} regiões com operação`
						: "Sem cobertura"
				}
				icon={Tag}
				label="Negociações abertas"
				tone="purple"
				value={String(openDeals)}
			/>
			<StoreMetricCard
				helper={
					totalLeads > 0
						? `${averageConversionRate}% sobre leads`
						: "Sem leads no período"
				}
				icon={Trophy}
				label="Taxa de conversão média"
				tone="amber"
				value={`${averageConversionRate}%`}
			/>
		</div>
	)
}

export { StoresMetricsGrid, StoresPageHeader }
