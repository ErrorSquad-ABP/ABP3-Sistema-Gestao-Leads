'use client';

import type { ComponentType } from 'react';

import { cn } from '@/lib/utils';

type Props = {
	icon: ComponentType<{ className?: string }>;
	label: string;
	count: number;
	total: string;
	index: number;
};

/** Largura comum: ponta direita e faixa do afundamento visual (itens 2+). */
const CHEVRON_PX = 24;

/**
 * Sempre: reta à esquerda da célula + ponta à direita.
 * O afundamento dos itens 2–4 NÃO vem do clip (evita “ponta” para fora) e sim do ::before.
 */
const RIBBON_CLIP = `polygon(0% 0%, calc(100% - ${CHEVRON_PX}px) 0%, 100% 50%, calc(100% - ${CHEVRON_PX}px) 100%, 0% 100%)`;

function PipelineStageRibbonItem({
	icon: Icon,
	label,
	count,
	total,
	index,
}: Props) {
	const isFirst = index === 0;

	return (
		<div
			className={cn(
				'relative h-[92px] min-w-0',
				/* “Mordida” com cor do fundo do ribbon: triângulo com vértice à direita da faixa, sem projetar à esquerda. */
				!isFirst &&
					'before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-[1] before:h-full before:w-6 before:bg-card before:[clip-path:polygon(0%_0%,100%_50%,0%_100%)]',
				index <= 1 ? 'bg-[color:var(--brand-accent-soft)]/70' : 'bg-muted',
			)}
			style={{
				clipPath: RIBBON_CLIP,
			}}
		>
			<div
				className={cn(
					'relative z-[2] flex h-full min-w-0 items-start gap-[11px] py-[17px] pr-9',
					isFirst ? 'pl-[25px]' : 'pl-[49px]',
				)}
			>
				<Icon className="mt-[2px] size-[18px] shrink-0 text-foreground/80" />
				<div className="min-w-0 flex-1">
					<div className="min-w-0">
						<p className="truncate text-[14px] font-extrabold leading-[17px] text-foreground">
							{label}
						</p>
					</div>
					<p className="mt-[5px] text-[12px] leading-[14px] text-muted-foreground">
						{count} negociações
					</p>
					<p className="mt-[7px] min-w-[100px] translate-x-[6px] text-right text-[12px] font-bold leading-[14px] text-foreground">
						{total}
					</p>
				</div>
			</div>
		</div>
	);
}

export { PipelineStageRibbonItem };
