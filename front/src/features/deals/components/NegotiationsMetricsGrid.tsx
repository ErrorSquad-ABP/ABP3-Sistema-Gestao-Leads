'use client';

import { KpiCard } from '@/components/metrics/KpiCard';
import { useDealsMetricsQuery } from '@/features/deals/hooks/deals.queries';
import { getNegotiationsTopMetrics } from '@/features/deals/lib/negotiations-metrics';

function NegotiationsMetricsGrid() {
	const query = useDealsMetricsQuery();
	const metrics = getNegotiationsTopMetrics(query.data ?? null);

	return (
		<div
			className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
			aria-busy={query.isPending ? 'true' : 'false'}
		>
			{metrics.map((metric) => {
				const Icon = metric.icon;
				return (
					<KpiCard
						description={
							query.isError ? 'Não foi possível carregar' : metric.description
						}
						icon={<Icon className="size-5" />}
						key={metric.key}
						title={metric.label}
						value={query.isError ? '--' : metric.value}
						variant={query.isError ? 'danger-soft' : metric.variant}
					/>
				);
			})}
		</div>
	);
}

export { NegotiationsMetricsGrid };
