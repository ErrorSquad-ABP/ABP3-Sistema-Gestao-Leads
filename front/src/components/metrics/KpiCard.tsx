import type { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type KpiCardVariant =
	| 'brand'
	| 'danger-soft'
	| 'neutral'
	| 'success'
	| 'warning';

type KpiCardDelta = {
	readonly label?: string;
	readonly tone: 'negative' | 'neutral' | 'positive';
	readonly value: string;
};

type KpiCardProps = {
	readonly action?: ReactNode;
	readonly className?: string;
	readonly description?: string;
	readonly delta?: KpiCardDelta;
	readonly icon?: ReactNode;
	readonly sparkline?: ReactNode;
	readonly sparklineLabel?: string;
	readonly title: string;
	readonly value: string;
	readonly variant?: KpiCardVariant;
};

const deltaClassNames: Record<KpiCardDelta['tone'], string> = {
	negative: 'text-[color:var(--text-negative)]',
	neutral: 'text-muted-foreground',
	positive: 'text-[color:var(--text-positive)]',
};

function variantClassName(variant: KpiCardVariant): string {
	switch (variant) {
		case 'danger-soft':
			return 'bg-[color:var(--kpi-surface-danger-soft)] text-[color:var(--kpi-icon-danger-soft)] ring-[color:var(--kpi-icon-danger-soft)]/15';
		case 'neutral':
			return 'bg-[color:var(--kpi-surface-neutral)] text-[color:var(--kpi-icon-neutral)] ring-[color:var(--kpi-icon-neutral)]/15';
		case 'success':
			return 'bg-[color:var(--kpi-surface-success)] text-[color:var(--kpi-icon-success)] ring-[color:var(--kpi-icon-success)]/15';
		case 'warning':
			return 'bg-[color:var(--kpi-surface-warning)] text-[color:var(--kpi-icon-warning)] ring-[color:var(--kpi-icon-warning)]/15';
		case 'brand':
			return 'bg-[color:var(--kpi-surface-brand)] text-[color:var(--kpi-icon-brand)] ring-[color:var(--kpi-icon-brand)]/15';
	}
}

function KpiCard({
	action,
	className,
	description,
	delta,
	icon,
	sparkline,
	sparklineLabel,
	title,
	value,
	variant = 'brand',
}: KpiCardProps) {
	return (
		<Card
			className={cn(
				'overflow-hidden border-border/90 bg-card shadow-sm',
				className,
			)}
		>
			<CardContent className="grid min-h-28 grid-cols-[1fr_auto] items-center gap-4 p-5">
				<div className="min-w-0">
					<div className="flex min-w-0 items-start gap-3">
						{icon ? (
							<span
								aria-hidden="true"
								className={cn(
									'flex size-11 shrink-0 items-center justify-center rounded-2xl ring-1',
									variantClassName(variant),
								)}
							>
								{icon}
							</span>
						) : null}
						<div className="min-w-0">
							<p className="text-xs font-medium text-muted-foreground">
								{title}
							</p>
							<p className="mt-1 truncate text-2xl leading-none font-semibold tracking-tight text-foreground">
								{value}
							</p>
							{description ? (
								<p className="mt-1 text-xs leading-5 text-muted-foreground">
									{description}
								</p>
							) : null}
						</div>
					</div>
					{delta ? (
						<p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
							<span
								className={cn('font-semibold', deltaClassNames[delta.tone])}
							>
								{delta.value}
							</span>
							{delta.label ? <span>{delta.label}</span> : null}
						</p>
					) : null}
				</div>
				{sparkline || action ? (
					<div className="flex shrink-0 items-center gap-3">
						{sparkline && sparklineLabel ? (
							<div aria-label={sparklineLabel} role="img">
								{sparkline}
							</div>
						) : null}
						{sparkline && !sparklineLabel ? (
							<div aria-hidden="true">{sparkline}</div>
						) : null}
						{action}
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}

export { KpiCard };
export type { KpiCardDelta, KpiCardProps, KpiCardVariant };
