'use client';

import type { ComponentType } from 'react';

import { cn } from '@/lib/utils';

type Props = {
	icon: ComponentType<{ className?: string }>;
	label: string;
	count: number;
	total: string;
	index: number;
	isLast: boolean;
};

function PipelineStageRibbonItem({
	icon: Icon,
	label,
	count,
	total,
	index,
	isLast,
}: Props) {
	const isFirst = index === 0;
	const clipPath = isFirst
		? 'polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)'
		: isLast
			? 'polygon(18px 0, 100% 0, 100% 100%, 18px 100%, 0 50%)'
			: 'polygon(18px 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 18px 100%, 0 50%)';

	return (
		<div
			className={cn(
				'relative flex h-[92px] min-w-0 items-start gap-[11px] px-[25px] py-[17px]',
				!isLast && 'pr-[34px]',
				index > 0 && 'pl-[36px]',
				isFirst
					? 'bg-[color:var(--brand-accent-soft)]/70'
					: 'bg-muted/35',
			)}
			style={{ clipPath }}
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
	);
}

export { PipelineStageRibbonItem };
