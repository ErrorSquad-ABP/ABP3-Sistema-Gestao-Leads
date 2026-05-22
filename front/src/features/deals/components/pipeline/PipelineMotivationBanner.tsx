'use client';

import { Trophy } from 'lucide-react';

function PipelineMotivationBanner() {
	return (
		<div className="relative mx-auto mt-7 flex w-max max-w-[540px] items-center gap-3 text-foreground before:h-[30px] before:w-[18px] before:opacity-80 before:content-['✦'] after:h-[30px] after:w-[18px] after:opacity-80 after:content-['✦']">
			<div className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-accent-soft)] text-[color:var(--brand-accent)]">
				<Trophy className="size-5" />
			</div>
			<div>
				<p className="mb-1 text-[11.5px] font-extrabold text-foreground/80">
					Avance as negociações no funil e aumente suas chances de fechar!
				</p>
				<p className="text-[11.3px] text-muted-foreground">
					Negociações quentes têm 3x mais chance de conversão.
				</p>
			</div>
		</div>
	);
}

export { PipelineMotivationBanner };
