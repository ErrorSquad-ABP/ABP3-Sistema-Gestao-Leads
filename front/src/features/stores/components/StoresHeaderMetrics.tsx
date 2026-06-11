'use client';

import {
	Building2,
	CheckCircle2,
	Plus,
	Search,
	Tag,
	Trophy,
	UsersRound,
} from 'lucide-react';

import { AppTableFilterDropdown } from '@/components/data/AppTableFilterDropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	AppPageHeader,
	appPageActionClass,
	appPageSearchClass,
} from '@/components/layout/AppPageHeader';
import { KpiCard, type KpiCardVariant } from '@/components/metrics/KpiCard';

type MetricTone = 'amber' | 'blue' | 'green' | 'orange' | 'purple';

type StoresPageHeaderProps = {
	canManageStores: boolean;
	onCreate: () => void;
	onRegionFilterChange: (value: string) => void;
	onSearchChange: (value: string) => void;
	regionFilter: string;
	regionOptions: Array<[string, string]>;
	search: string;
};

type StoresMetricsGridProps = {
	activeStores: number;
	averageLeads: number;
	averageConversionRate: number;
	openDeals: number;
	storesCount: number;
	totalLeads: number;
	uniqueStates: string[];
};

function getMetricVariant(tone: MetricTone): KpiCardVariant {
	switch (tone) {
		case 'amber':
			return 'warning';
		case 'blue':
			return 'neutral';
		case 'green':
			return 'success';
		case 'orange':
			return 'brand';
		case 'purple':
			return 'neutral';
	}
}

function StoreMetricCard({
	helper,
	icon: Icon,
	label,
	tone,
	value,
}: {
	helper: string;
	icon: typeof Building2;
	label: string;
	tone: MetricTone;
	value: string;
}) {
	return (
		<KpiCard
			description={helper}
			icon={<Icon className="size-5" />}
			title={label}
			value={value}
			variant={getMetricVariant(tone)}
		/>
	);
}

function StoresPageHeader({
	canManageStores,
	onCreate,
	onRegionFilterChange,
	onSearchChange,
	regionFilter,
	regionOptions,
	search,
}: StoresPageHeaderProps) {
	return (
		<AppPageHeader
			action={
				<Button
					className={appPageActionClass}
					disabled={!canManageStores}
					onClick={onCreate}
				>
					<Plus className="size-4" />
					Nova loja
				</Button>
			}
			controls={
				<>
					<div className="relative w-full sm:w-[360px]">
						<Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#667085]" />
						<Input
							className={appPageSearchClass}
							onChange={(event) => onSearchChange(event.target.value)}
							placeholder="Buscar por nome, cidade ou responsável..."
							value={search}
						/>
					</div>
					<AppTableFilterDropdown
						defaultValue="ALL"
						label="Região"
						onValueChange={onRegionFilterChange}
						options={[
							{ value: 'ALL', label: 'Todas as regiões' },
							...regionOptions.map(([state, label]) => ({
								value: state,
								label,
							})),
						]}
						value={regionFilter}
					/>
				</>
			}
			description="Centralize todas as unidades do seu negócio e acompanhe seu desempenho."
			title="Gestão de lojas"
		/>
	);
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
						: 'Sem cobertura'
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
						: 'Sem leads no período'
				}
				icon={Trophy}
				label="Taxa de conversão média"
				tone="amber"
				value={`${averageConversionRate}%`}
			/>
		</div>
	);
}

export { StoresMetricsGrid, StoresPageHeader };
