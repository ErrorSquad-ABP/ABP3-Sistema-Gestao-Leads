'use client';

import type { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { NegotiationsMetric } from '@/features/deals/lib/negotiations-metrics';

type Props = {
	metric: NegotiationsMetric;
	rightSlot?: ReactNode;
};

function NegotiationsMetricCard({ metric, rightSlot }: Props) {
	const Icon = metric.icon;

	return (
		<Card className="rounded-3xl border-border/90 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.02)]">
			<CardContent className="flex items-center gap-4 p-5">
				<div
					className={cn(
						'flex size-12 items-center justify-center rounded-2xl bg-[color:var(--brand-accent-soft)] text-[color:var(--brand-accent)]',
						metric.tone === 'neutral' ? 'opacity-95' : '',
					)}
				>
					<Icon className="size-5" />
				</div>

				<div className="min-w-0 flex-1">
					<p className="text-xs font-medium text-muted-foreground">
						{metric.label}
					</p>
					<p className="mt-1 truncate text-lg font-semibold tracking-tight text-foreground">
						{metric.value}
					</p>
					<p className="mt-1 text-xs font-medium text-emerald-600">
						{metric.change}
					</p>
				</div>

				{rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
			</CardContent>
		</Card>
	);
}

export { NegotiationsMetricCard };
