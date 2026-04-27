'use client';

import { Card, CardContent } from '@/components/ui/card';

import type {
	PipelineSummaryData,
	PipelineSummarySegment,
} from './negotiations-right-summary.data';

function conicFromSegments(segments: PipelineSummarySegment[]) {
	const sum = segments.reduce((a, s) => a + s.percentage, 0);
	if (sum <= 0) {
		return 'conic-gradient(from -90deg, var(--muted) 0deg 360deg)';
	}
	let deg = 0;
	const parts: string[] = [];
	for (const s of segments) {
		const w = (s.percentage / 100) * 360;
		parts.push(`${s.color} ${deg}deg ${deg + w}deg`);
		deg += w;
	}
	return `conic-gradient(from -90deg, ${parts.join(', ')})`;
}

type Props = {
	data: PipelineSummaryData;
};

function PipelineSummaryCard({ data }: Props) {
	const { segments, centerValueLabel, centerSubLabel } = data;
	return (
		<Card className="min-w-0 max-w-full rounded-xl border border-border/90 bg-white shadow-none">
			<CardContent className="p-4 pt-4">
				<h3 className="text-[15px] font-extrabold text-foreground">
					Resumo do funil
				</h3>
				<div className="mt-3 flex min-w-0 items-center gap-3">
					<div className="relative h-[120px] w-[120px] shrink-0">
						<div
							className="h-full w-full rounded-full"
							style={{ background: conicFromSegments(segments) }}
						/>
						<div className="absolute inset-0 m-auto flex h-[58%] w-[58%] min-w-0 flex-col items-center justify-center rounded-full bg-card text-center">
							<span className="block max-w-[68px] truncate whitespace-nowrap text-center text-[clamp(6px,0.55vw,10px)] font-extrabold leading-none tracking-[-0.05em] text-foreground">
								{centerValueLabel}
							</span>
							<span className="mt-0.5 text-[12px] text-muted-foreground">
								{centerSubLabel}
							</span>
						</div>
					</div>
					<ul
						className="min-w-0 flex-1 space-y-2.5 pl-0.5"
						aria-label="Partes do funil"
					>
						{segments.map((s) => (
							<li
								key={s.stage}
								className="flex min-w-0 items-baseline justify-between gap-2"
							>
								<div className="flex min-w-0 items-center gap-2">
									<span
										className="size-2.5 shrink-0 rounded-full"
										style={{ background: s.color }}
									/>
									<span className="truncate text-[12px] text-foreground">
										{s.label}
									</span>
								</div>
								<span className="shrink-0 text-[12px] font-medium tabular-nums text-foreground/90">
									{s.percentage}%
								</span>
							</li>
						))}
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}

export { PipelineSummaryCard, conicFromSegments };
