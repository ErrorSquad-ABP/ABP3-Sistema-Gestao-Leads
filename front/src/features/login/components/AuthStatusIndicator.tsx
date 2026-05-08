'use client';

import { Info } from 'lucide-react';
import type { ReactNode } from 'react';

type AuthStatusIndicatorProps = {
	icon: ReactNode;
	id: string;
	label: string;
	message: string;
};

function AuthStatusIndicator({
	icon,
	id,
	label,
	message,
}: AuthStatusIndicatorProps) {
	return (
		<div className="fixed right-5 top-5 z-30">
			<div className="group relative">
				<button
					aria-describedby={id}
					aria-label={label}
					className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent-soft)]"
					type="button"
				>
					{icon}
				</button>
				<div
					className="pointer-events-none absolute right-0 top-12 w-72 rounded-2xl border border-border bg-card px-3 py-2.5 text-sm leading-6 text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
					id={id}
					role="tooltip"
				>
					<div className="mb-1 flex items-center gap-2 text-foreground">
						<Info
							aria-hidden="true"
							className="size-4 text-[color:var(--brand-accent)]"
						/>
						<span className="font-medium">{label}</span>
					</div>
					<p>{message}</p>
				</div>
			</div>
		</div>
	);
}

export { AuthStatusIndicator };
