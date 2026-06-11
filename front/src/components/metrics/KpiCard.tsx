import type { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
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

function KpiTextTooltip({
	children,
	className,
	content,
}: {
	children: ReactNode;
	className: string;
	content: string;
}) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<p className={className}>{children}</p>
				</TooltipTrigger>
				<TooltipContent sideOffset={6}>{content}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

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
				'h-28 min-h-28 overflow-hidden border-border/90 bg-card shadow-sm',
				className,
			)}
		>
			<CardContent className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 overflow-hidden p-4">
				<div className="min-w-0 overflow-hidden">
					<div className="flex min-w-0 items-start gap-3">
						{icon ? (
							<span
								aria-hidden="true"
								className={cn(
									'flex size-10 shrink-0 items-center justify-center rounded-xl ring-1',
									variantClassName(variant),
								)}
							>
								{icon}
							</span>
						) : null}
						<div className="min-w-0 flex-1 overflow-hidden">
							<KpiTextTooltip
								className="truncate text-xs font-medium text-muted-foreground"
								content={title}
							>
								{title}
							</KpiTextTooltip>
							<KpiTextTooltip
								className="mt-1 truncate text-xl leading-none font-semibold tracking-tight text-foreground"
								content={value}
							>
								{value}
							</KpiTextTooltip>
							{description ? (
								<KpiTextTooltip
									className="mt-1 truncate text-xs leading-4 text-muted-foreground"
									content={description}
								>
									{description}
								</KpiTextTooltip>
							) : null}
						</div>
					</div>
					{delta ? (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="mt-2 flex min-w-0 items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
										<span
											className={cn(
												'min-w-0 max-w-[45%] truncate font-semibold',
												deltaClassNames[delta.tone],
											)}
										>
											{delta.value}
										</span>
										{delta.label ? (
											<span className="min-w-0 flex-1 truncate">
												{delta.label}
											</span>
										) : null}
									</div>
								</TooltipTrigger>
								<TooltipContent sideOffset={6}>
									{delta.value}
									{delta.label ? ` ${delta.label}` : ''}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
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
