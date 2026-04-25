'use client';

import { Flame, Snowflake, Sun } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type {
	ImportanceKind,
	ImportanceSummaryData,
} from './negotiations-right-summary.data';

const iconByKind: Record<ImportanceKind, typeof Flame> = {
	HOT: Flame,
	WARM: Sun,
	COLD: Snowflake,
};

const textByKind: Record<ImportanceKind, string> = {
	HOT: 'text-[color:var(--brand-accent)]',
	WARM: 'text-amber-600',
	COLD: 'text-sky-500',
};

type Props = {
	data: ImportanceSummaryData;
};

function ImportanceSummaryCard({ data }: Props) {
	return (
		<Card className="min-w-0 max-w-full rounded-xl border border-border/90 bg-white shadow-none">
			<CardContent className="p-4 pt-4">
				<h3 className="text-[15px] font-extrabold text-foreground">
					Negociações por importância
				</h3>
				<ul className="mt-3.5 space-y-3" aria-label="Valores por importância">
					{data.items.map((row) => {
						const Icon = iconByKind[row.kind];
						return (
							<li
								key={row.kind}
								className="flex min-w-0 items-center justify-between gap-2"
							>
								<div className="flex min-w-0 items-center gap-2.5">
									<Icon
										className={cn('size-[18px] shrink-0', textByKind[row.kind])}
										strokeWidth={2.25}
										aria-hidden
									/>
									<span
										className={cn(
											'truncate text-[12.5px] font-medium',
											textByKind[row.kind],
										)}
									>
										{row.label}
									</span>
								</div>
								<div className="flex shrink-0 items-baseline gap-3">
									<span className="text-right text-[12.5px] font-semibold tabular-nums text-foreground/90">
										{row.amountLabel}
									</span>
									<span className="w-8 text-right text-[12.5px] font-medium tabular-nums text-muted-foreground">
										{row.percentage}%
									</span>
								</div>
							</li>
						);
					})}
				</ul>
			</CardContent>
		</Card>
	);
}

export { ImportanceSummaryCard };
