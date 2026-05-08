'use client';

import {
	Activity,
	ArrowRight,
	Building2,
	Clock3,
	Funnel,
	Handshake,
	RefreshCcw,
	Users,
} from 'lucide-react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Pie,
	PieChart,
	XAxis,
	YAxis,
} from 'recharts';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from '@/components/ui/chart';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { appRoutes } from '@/lib/routes/app-routes';
import { isApiError } from '@/lib/http/api-error';
import Link from 'next/link';

import { useOperationalDashboardQuery } from '../hooks/operational-dashboard.queries';
import type {
	DashboardDistributionItem,
	OperationalDashboardSourceKey,
} from '../model/operational-dashboard.model';

type OperationalDashboardPageContentProps = {
	user: AuthenticatedUser;
};

const SOURCE_LABELS: Record<OperationalDashboardSourceKey, string> = {
	'digital-form': 'Formulário',
	facebook: 'Facebook',
	indication: 'Indicação',
	instagram: 'Instagram',
	'mercado-livre': 'Mercado Livre',
	other: 'Outros',
	'phone-call': 'Telefone',
	'store-visit': 'Visita loja',
	whatsapp: 'WhatsApp',
};

const STATUS_LABELS: Record<string, string> = {
	NEW: 'Novo',
	CONTACTED: 'Contactado',
	QUALIFIED: 'Qualificado',
	DISQUALIFIED: 'Desqualificado',
	CONVERTED: 'Convertido',
};

const IMPORTANCE_LABELS: Record<string, string> = {
	COLD: 'Frio',
	WARM: 'Morno',
	HOT: 'Quente',
};

const chartConfig = {
	count: {
		label: 'Leads',
		color: '#2D3648',
	},
} satisfies ChartConfig;

function formatCount(value: number) {
	return new Intl.NumberFormat('pt-BR').format(value);
}

function formatPeriod(startDateIso: string, endDateIso: string) {
	const formatter = new Intl.DateTimeFormat('pt-BR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
	return `${formatter.format(new Date(startDateIso))} até ${formatter.format(
		new Date(endDateIso),
	)}`;
}

function isEmptyDashboard(
	totalLeads: number,
	items: readonly DashboardDistributionItem<string>[],
) {
	return totalLeads === 0 && items.every((item) => item.count === 0);
}

function OperationalDashboardPageContent({
	user,
}: OperationalDashboardPageContentProps) {
	const query = useOperationalDashboardQuery();

	if (query.isPending) {
		return (
			<section className="space-y-6">
				<div className="grid gap-4 md:grid-cols-3">
					<Skeleton className="h-28 rounded-xl" />
					<Skeleton className="h-28 rounded-xl" />
					<Skeleton className="h-28 rounded-xl" />
				</div>
				<Skeleton className="h-80 rounded-xl" />
				<Skeleton className="h-80 rounded-xl" />
			</section>
		);
	}

	if (query.isError) {
		return (
			<section className="space-y-6">
				<Card className="border-destructive/30">
					<CardHeader>
						<CardTitle>Falha ao carregar dashboard operacional</CardTitle>
						<CardDescription>
							{isApiError(query.error)
								? query.error.message
								: 'Não foi possível carregar os indicadores agora.'}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							className="rounded-md"
							onClick={() => query.refetch()}
							type="button"
							variant="outline"
						>
							<RefreshCcw className="size-4" />
							Tentar novamente
						</Button>
					</CardContent>
				</Card>
			</section>
		);
	}

	const dashboard = query.data;
	const periodLabel = formatPeriod(
		dashboard.period.startDate,
		dashboard.period.endDate,
	);
	const empty = isEmptyDashboard(
		dashboard.totals.totalLeads,
		dashboard.distributions.byStatus,
	);

	const byStatusChartData = dashboard.distributions.byStatus.map((item) => ({
		label: STATUS_LABELS[item.key] ?? item.key,
		count: item.count,
		percentage: item.percentage,
	}));

	const bySourceChartData = dashboard.distributions.bySource.map((item) => ({
		label: SOURCE_LABELS[item.key as OperationalDashboardSourceKey] ?? item.key,
		count: item.count,
		percentage: item.percentage,
	}));

	const byStoreChartData = dashboard.distributions.byStore.map((item) => ({
		label: item.storeName,
		count: item.count,
		percentage: item.percentage,
	}));

	const byImportanceChartData = dashboard.distributions.byImportance.map(
		(item) => ({
			label: IMPORTANCE_LABELS[item.key] ?? item.key,
			count: item.count,
			percentage: item.percentage,
		}),
	);

	return (
		<section className="space-y-6">
			<header className="space-y-2">
				<p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
					Dashboard operacional
				</p>
				<h1 className="text-3xl font-semibold tracking-tight text-foreground">
					Pipeline dos últimos {dashboard.period.days} dias
				</h1>
				<p className="text-sm text-muted-foreground">
					{periodLabel} • Perfil {user.role} • Escopo{' '}
					{dashboard.scope.storeIds === null
						? 'global'
						: `${dashboard.scope.storeIds.length} loja(s)`}
				</p>
			</header>

			<div className="grid gap-4 md:grid-cols-3">
				<Card className="rounded-xl border-border/80">
					<CardHeader className="pb-3">
						<CardDescription>Total de leads</CardDescription>
						<CardTitle className="text-3xl font-semibold">
							{formatCount(dashboard.totals.totalLeads)}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
						<Funnel className="size-4 text-[#d96c3f]" />
						Base para status, origem e loja
					</CardContent>
				</Card>
				<Card className="rounded-xl border-border/80">
					<CardHeader className="pb-3">
						<CardDescription>Leads com negociação aberta</CardDescription>
						<CardTitle className="text-3xl font-semibold">
							{formatCount(dashboard.totals.totalLeadsWithOpenDeal)}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
						<Handshake className="size-4 text-[#d96c3f]" />
						Base para distribuição por importância
					</CardContent>
				</Card>
				<Card className="rounded-xl border-border/80">
					<CardHeader className="pb-3">
						<CardDescription>Atualização</CardDescription>
						<CardTitle className="text-lg font-semibold">
							Filtro padrão de 30 dias ativo
						</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
						<Clock3 className="size-4 text-[#d96c3f]" />
						Período já validado no backend
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card className="rounded-xl border-border/80">
					<CardHeader>
						<CardTitle>Status dos leads</CardTitle>
						<CardDescription>
							Distribuição por etapa operacional
						</CardDescription>
					</CardHeader>
					<CardContent className="h-80">
						<ChartContainer className="h-full w-full" config={chartConfig}>
							<BarChart data={byStatusChartData}>
								<CartesianGrid vertical={false} />
								<XAxis dataKey="label" tickLine={false} axisLine={false} />
								<YAxis allowDecimals={false} />
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />}
								/>
								<Bar dataKey="count" fill="var(--color-count)" radius={6} />
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>

				<Card className="rounded-xl border-border/80">
					<CardHeader>
						<CardTitle>Importância das negociações</CardTitle>
						<CardDescription>
							Baseada em negociações abertas por lead
						</CardDescription>
					</CardHeader>
					<CardContent className="h-80">
						<ChartContainer className="h-full w-full" config={chartConfig}>
							<PieChart>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />}
								/>
								<Pie
									data={byImportanceChartData}
									dataKey="count"
									nameKey="label"
									cx="50%"
									cy="50%"
									outerRadius={100}
									fill="var(--color-count)"
								/>
							</PieChart>
						</ChartContainer>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card className="rounded-xl border-border/80">
					<CardHeader>
						<CardTitle>Origens dos leads</CardTitle>
						<CardDescription>Canais de entrada do pipeline</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{bySourceChartData.map((item) => (
							<div
								className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm"
								key={item.label}
							>
								<span className="text-foreground">{item.label}</span>
								<span className="font-medium">{formatCount(item.count)}</span>
								<span className="text-muted-foreground">
									{item.percentage.toFixed(2)}%
								</span>
							</div>
						))}
					</CardContent>
				</Card>
				<Card className="rounded-xl border-border/80">
					<CardHeader>
						<CardTitle>Lojas no período</CardTitle>
						<CardDescription>Distribuição do volume por loja</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{byStoreChartData.length > 0 ? (
							byStoreChartData.map((item) => (
								<div
									className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm"
									key={item.label}
								>
									<span className="text-foreground">{item.label}</span>
									<span className="font-medium">{formatCount(item.count)}</span>
									<span className="text-muted-foreground">
										{item.percentage.toFixed(2)}%
									</span>
								</div>
							))
						) : (
							<p className="text-sm text-muted-foreground">
								Nenhuma loja com leads no período selecionado.
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			{empty ? (
				<Card className="rounded-xl border-border/80">
					<CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
						<Activity className="size-8 text-[#d96c3f]" />
						<p className="font-medium">Sem dados para o período atual</p>
						<p className="max-w-xl text-sm text-muted-foreground">
							O dashboard já está conectado, mas não há leads no recorte
							aplicado.
						</p>
					</CardContent>
				</Card>
			) : null}

			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<Button
					asChild
					className="h-11 w-full justify-between rounded-md"
					variant="outline"
				>
					<Link href={appRoutes.app.leads}>
						<span className="inline-flex items-center gap-2">
							<Users className="size-4" />
							Leads
						</span>
						<ArrowRight className="size-4" />
					</Link>
				</Button>
				<Button
					asChild
					className="h-11 w-full justify-between rounded-md"
					variant="outline"
				>
					<Link href={appRoutes.app.deals}>
						<span className="inline-flex items-center gap-2">
							<Handshake className="size-4" />
							Negociações
						</span>
						<ArrowRight className="size-4" />
					</Link>
				</Button>
				<Button
					asChild
					className="h-11 w-full justify-between rounded-md"
					variant="outline"
				>
					<Link href={appRoutes.app.stores}>
						<span className="inline-flex items-center gap-2">
							<Building2 className="size-4" />
							Lojas
						</span>
						<ArrowRight className="size-4" />
					</Link>
				</Button>
				<Button
					asChild
					className="h-11 w-full justify-between rounded-md"
					variant="outline"
				>
					<Link href={appRoutes.app.teams}>
						<span className="inline-flex items-center gap-2">
							<Users className="size-4" />
							Equipes
						</span>
						<ArrowRight className="size-4" />
					</Link>
				</Button>
			</div>
		</section>
	);
}

export { OperationalDashboardPageContent };
