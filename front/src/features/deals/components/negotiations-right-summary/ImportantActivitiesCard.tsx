'use client';

import {
	CalendarDays,
	MessageSquare,
	Phone,
	type LucideIcon,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type {
	ActivityIcon,
	ImportantActivity,
} from './negotiations-right-summary.data';

const iconMap: Record<ActivityIcon, { Icon: LucideIcon; wrap: string }> = {
	calendar: {
		Icon: CalendarDays,
		wrap: 'bg-rose-100/90 text-rose-600',
	},
	phone: {
		Icon: Phone,
		wrap: 'bg-sky-100/90 text-sky-600',
	},
	message: {
		Icon: MessageSquare,
		wrap: 'bg-sky-100/90 text-sky-600',
	},
};

type Props = {
	items: ImportantActivity[];
};

function ImportantActivitiesCard({ items }: Props) {
	return (
		<Card className="min-w-0 max-w-full rounded-xl border border-border/90 bg-white shadow-none">
			<CardContent className="p-4 pt-4">
				<div className="flex items-start justify-between gap-2">
					<h3 className="text-[15px] font-extrabold text-foreground">
						Atividades importantes
					</h3>
					<a
						href="#atividades"
						className="shrink-0 text-[12.5px] font-semibold text-[color:var(--brand-accent)] hover:underline"
					>
						Ver todas
					</a>
				</div>
				<ul className="mt-3.5 space-y-3.5" aria-label="Atividades">
					{items.map((a) => {
						const { Icon, wrap } = iconMap[a.icon];
						return (
							<li key={a.id} className="flex min-w-0 items-start gap-2.5">
								<div
									className={cn(
										'flex size-9 shrink-0 items-center justify-center rounded-full',
										wrap,
									)}
									aria-hidden
								>
									<Icon className="size-4" strokeWidth={2.1} />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-[12.5px] font-extrabold leading-snug text-foreground">
										{a.title}
									</p>
									<p className="mt-0.5 text-[12px] text-muted-foreground">
										{a.time}
									</p>
								</div>
								<span className="shrink-0 rounded-md bg-secondary/80 px-2 py-0.5 text-[10.5px] font-semibold text-foreground/90">
									{a.tag}
								</span>
							</li>
						);
					})}
				</ul>
			</CardContent>
		</Card>
	);
}

export { ImportantActivitiesCard };
