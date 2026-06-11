import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AppPageHeaderProps = {
	action?: ReactNode;
	className?: string;
	controls?: ReactNode;
	description: ReactNode;
	title: ReactNode;
};

function AppPageHeader({
	action,
	className,
	controls,
	description,
	title,
}: AppPageHeaderProps) {
	return (
		<header
			className={cn(
				'flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between',
				className,
			)}
		>
			<div className="min-w-0 space-y-2">
				<h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
					{title}
				</h1>
				<p className="max-w-4xl text-sm text-[#667085]">{description}</p>
			</div>
			{controls || action ? (
				<div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end xl:w-auto">
					{controls}
					{action}
				</div>
			) : null}
		</header>
	);
}

const appPageSearchClass =
	'h-12 rounded-xl border-[#d8e0ea] bg-white pl-11 shadow-none focus-visible:border-[color:var(--brand-accent)]/45 focus-visible:ring-0';

const appPageActionClass =
	'h-12 shrink-0 rounded-xl bg-[color:var(--brand-accent)] px-5 font-semibold text-white shadow-none hover:bg-[color:var(--brand-accent-hover)]';

export { AppPageHeader, appPageActionClass, appPageSearchClass };
