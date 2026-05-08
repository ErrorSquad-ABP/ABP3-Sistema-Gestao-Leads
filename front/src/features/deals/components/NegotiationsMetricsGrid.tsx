'use client';

import type { Deal } from '@/features/deals/model/deals.model';
import { getNegotiationsTopMetrics } from '@/features/deals/lib/negotiations-metrics';
import { NegotiationsMetricCard } from '@/features/deals/components/NegotiationsMetricCard';

type Props = {
	deals: Deal[];
};

function NegotiationsMetricsGrid({ deals }: Props) {
	const metrics = getNegotiationsTopMetrics(deals);

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
			{metrics.map((metric) => (
				<NegotiationsMetricCard key={metric.key} metric={metric} />
			))}
		</div>
	);
}

export { NegotiationsMetricsGrid };
