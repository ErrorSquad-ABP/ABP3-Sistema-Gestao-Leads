'use client';

import {
	Building2,
	CheckCircle2,
	Globe2,
	Plus,
	UsersRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type MetricTone = 'amber' | 'blue' | 'green' | 'orange';

type StoresPageHeaderProps = {
	canManageStores: boolean;
	onCreate: () => void;
};

type StoresMetricsGridProps = {
	activeStores: number;
	averageLeads: number;
	storesCount: number;
	uniqueStates: string[];
};

function getMetricToneClass(tone: MetricTone) {
	switch (tone) {
		case 'amber':
			return 'bg-[#fff7e6] text-[#f79009]';
		case 'blue':
			return 'bg-[#eff6ff] text-[#2563eb]';
		case 'green':
			return 'bg-[#ecfdf3] text-[#079455]';
		case 'orange':
			return 'bg-[#fff3ee] text-[#f4511e]';
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
	const toneClass = getMetricToneClass(tone);

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
	);
}

function StoresPageHeader({
	canManageStores,
	onCreate,
}: StoresPageHeaderProps) {
	return (
		<header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight text-[#101828]">
					Lojas
				</h1>
				<p className="max-w-4xl text-sm text-[#667085]">
					Estrutura operacional utilizada para distribuição e governança dos
					leads no pipeline comercial.
				</p>
			</div>
			<Button
				className="h-11 rounded-xl bg-[#f4511e] px-5 text-sm text-white shadow-sm hover:bg-[#dc3f13]"
				disabled={!canManageStores}
				onClick={onCreate}
			>
				<Plus className="size-4" />
				Nova loja
			</Button>
		</header>
	);
}

function StoresMetricsGrid({
	activeStores,
	averageLeads,
	storesCount,
	uniqueStates,
}: StoresMetricsGridProps) {
	return (
		<div className="grid gap-4 xl:grid-cols-4">
			<StoreMetricCard
				helper="Em todas as operações"
				icon={Building2}
				label="Total de lojas"
				tone="orange"
				value={String(storesCount)}
			/>
			<StoreMetricCard
				helper="Disponíveis para operação"
				icon={CheckCircle2}
				label="Lojas ativas"
				tone="green"
				value={String(activeStores)}
			/>
			<StoreMetricCard
				helper="Média por loja"
				icon={UsersRound}
				label="Leads por loja"
				tone="blue"
				value={String(averageLeads)}
			/>
			<StoreMetricCard
				helper={
					uniqueStates.length > 0
						? 'Estados com operação ativa'
						: 'Sem cobertura'
				}
				icon={Globe2}
				label="Cobertura operacional"
				tone="amber"
				value={`${uniqueStates.length} regiões`}
			/>
		</div>
	);
}

export { StoresMetricsGrid, StoresPageHeader };
