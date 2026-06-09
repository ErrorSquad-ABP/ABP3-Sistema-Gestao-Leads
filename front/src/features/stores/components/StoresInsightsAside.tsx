'use client';

import {
	Building2,
	ChartNoAxesCombined,
	CheckCircle2,
	UsersRound,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

import type { StoreTableRow } from '../lib/store-view';

type StoresInsightsAsideProps = {
	rows: StoreTableRow[];
	storesCount: number;
};

const PERFORMANCE_COLORS = [
	'#ff8a5c',
	'#a855f7',
	'#5b8def',
	'#f7b731',
	'#34c759',
] as const;

const DISTRIBUTION_TONES = [
	{
		bg: 'bg-[#fff3ee]',
		icon: Building2,
		text: 'text-[#f4511e]',
	},
	{
		bg: 'bg-[#f4edff]',
		icon: UsersRound,
		text: 'text-[#7f35e8]',
	},
	{
		bg: 'bg-[#eff6ff]',
		icon: ChartNoAxesCombined,
		text: 'text-[#2563eb]',
	},
	{
		bg: 'bg-[#ecfdf3]',
		icon: CheckCircle2,
		text: 'text-[#079455]',
	},
	{
		bg: 'bg-[#fff7e6]',
		icon: Building2,
		text: 'text-[#f79009]',
	},
] as const;

const PEOPLE_MARKERS = [
	'one',
	'two',
	'three',
	'four',
	'five',
	'six',
	'seven',
	'eight',
];

function formatCount(value: number) {
	return Math.round(value).toLocaleString('pt-BR');
}

function getTopStores(rows: StoreTableRow[]) {
	return [...rows]
		.sort(
			(left, right) =>
				right.leadCount - left.leadCount ||
				right.openDealsCount - left.openDealsCount ||
				left.store.name.localeCompare(right.store.name, 'pt-BR'),
		)
		.slice(0, 5);
}

function getDistributionRows(rows: StoreTableRow[], storesCount: number) {
	const distribution = new Map<string, number>();

	for (const row of rows) {
		distribution.set(
			row.distributionRegion,
			(distribution.get(row.distributionRegion) ?? 0) + 1,
		);
	}

	return [...distribution.entries()]
		.map(([label, count]) => ({
			count,
			label,
			percentage: storesCount ? Math.round((count / storesCount) * 100) : 0,
		}))
		.sort(
			(left, right) =>
				right.count - left.count ||
				left.label.localeCompare(right.label, 'pt-BR'),
		)
		.slice(0, 5);
}

function StorePerformanceCard({ rows }: { rows: StoreTableRow[] }) {
	const topStores = getTopStores(rows);
	const maxLeads = Math.max(1, ...topStores.map((row) => row.leadCount));

	return (
		<Card className="rounded-2xl border-[#dfe7f1] bg-white shadow-sm">
			<CardContent className="space-y-5 p-5">
				<div>
					<div>
						<h2 className="text-base font-bold text-[#101828]">
							Desempenho das lojas
						</h2>
						<p className="text-xs text-[#667085]">
							Visão geral do período selecionado
						</p>
					</div>
				</div>

				<div className="space-y-3">
					{topStores.length > 0 ? (
						<>
							<div className="grid items-center gap-4 border-b border-[#eef2f6] pb-2 md:grid-cols-[132px_minmax(160px,1fr)_88px_104px_88px]">
								<span className="hidden md:block" />
								<span className="hidden md:block" />
								<span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1f2a44]">
									<UsersRound className="size-3 text-[#f4511e]" />
									Leads
								</span>
								<span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1f2a44]">
									<ChartNoAxesCombined className="size-3 text-[#7f35e8]" />
									Negociações
								</span>
								<span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1f2a44]">
									<CheckCircle2 className="size-3 text-[#079455]" />
									Conversão
								</span>
							</div>
							{topStores.map((row, index) => {
								const barWidth = Math.max((row.leadCount / maxLeads) * 100, 8);
								return (
									<div
										className="grid items-center gap-4 md:grid-cols-[132px_minmax(160px,1fr)_88px_104px_88px]"
										key={row.store.id}
									>
										<p className="truncate text-xs font-semibold text-[#1f2a44]">
											{row.store.name}
										</p>
										<div className="h-3 overflow-hidden rounded-full bg-[#eef2f6]">
											<div
												className="h-full rounded-full shadow-[0_5px_14px_rgba(16,24,40,0.08)]"
												style={{
													backgroundColor:
														PERFORMANCE_COLORS[
															index % PERFORMANCE_COLORS.length
														],
													width: `${barWidth}%`,
												}}
											/>
										</div>
										<div>
											<p className="text-sm font-bold text-[#101828]">
												{formatCount(row.leadCount)}
											</p>
											<p className="text-[11px] text-[#079455]">
												{formatCount(row.convertedLeadCount)} conv.
											</p>
										</div>
										<div>
											<p className="text-sm font-bold text-[#101828]">
												{formatCount(row.openDealsCount)}
											</p>
											<p className="text-[11px] text-[#667085]">abertas</p>
										</div>
										<div>
											<p className="text-sm font-bold text-[#101828]">
												{row.conversionRate}%
											</p>
											<p className="text-[11px] text-[#079455]">conversão</p>
										</div>
									</div>
								);
							})}
						</>
					) : (
						<div className="rounded-2xl border border-[#e6ecf3] bg-[#f8fafc] px-4 py-8 text-sm text-[#667085]">
							Nenhuma loja cadastrada.
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function StoreDistributionCard({
	rows,
	storesCount,
}: StoresInsightsAsideProps) {
	const distributionRows = getDistributionRows(rows, storesCount);

	return (
		<Card className="rounded-2xl border-[#dfe7f1] bg-white shadow-sm">
			<CardContent className="space-y-5 p-5">
				<div>
					<h2 className="text-base font-bold text-[#101828]">
						Distribuição das lojas
					</h2>
					<p className="text-xs text-[#667085]">Por região do Brasil</p>
				</div>

				<div className="divide-y divide-[#eef2f6]">
					{distributionRows.length > 0 ? (
						distributionRows.map((row, index) => {
							const tone =
								DISTRIBUTION_TONES[index % DISTRIBUTION_TONES.length];
							const Icon = tone.icon;
							const peopleCount = Math.max(1, Math.min(row.count, 8));
							return (
								<div
									className="grid grid-cols-[44px_minmax(0,1fr)_92px_44px] items-center gap-3 py-3 first:pt-0 last:pb-0"
									key={row.label}
								>
									<div
										className={`flex size-9 items-center justify-center rounded-full ${tone.bg} ${tone.text}`}
									>
										<Icon className="size-4" />
									</div>
									<div className="min-w-0">
										<p className="truncate text-xs font-bold text-[#1f2a44]">
											{row.label}
										</p>
										<p className="text-[11px] text-[#667085]">
											{row.count} {row.count === 1 ? 'loja' : 'lojas'}
										</p>
									</div>
									<div className={`flex justify-end gap-1 ${tone.text}`}>
										{PEOPLE_MARKERS.slice(0, peopleCount).map((marker) => (
											<UsersRound
												className="size-3.5"
												key={`${row.label}-${marker}`}
											/>
										))}
									</div>
									<p className="text-right text-xs font-bold text-[#1f2a44]">
										{row.percentage}%
									</p>
								</div>
							);
						})
					) : (
						<p className="rounded-2xl border border-[#e6ecf3] bg-[#f8fafc] px-4 py-8 text-sm text-[#667085]">
							Nenhuma distribuição disponível.
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function StoresInsightsAside({ rows, storesCount }: StoresInsightsAsideProps) {
	return (
		<section className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
			<StorePerformanceCard rows={rows} />
			<StoreDistributionCard rows={rows} storesCount={storesCount} />
		</section>
	);
}

export { StoresInsightsAside };
