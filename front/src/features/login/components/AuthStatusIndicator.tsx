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
					className="flex size-10 items-center justify-center rounded-full border border-[#d6dce5] bg-white text-[#1b2430] transition-colors hover:bg-[#f2f4f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0cdbf]"
					type="button"
				>
					{icon}
				</button>
				<div
					className="pointer-events-none absolute right-0 top-12 w-72 rounded-2xl border border-[#d6dce5] bg-white px-3 py-2.5 text-sm leading-6 text-[#6b7687] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
					id={id}
					role="tooltip"
				>
					<div className="mb-1 flex items-center gap-2 text-[#1b2430]">
						<Info aria-hidden="true" className="size-4 text-[#D96C3F]" />
						<span className="font-medium">{label}</span>
					</div>
					<p>{message}</p>
				</div>
			</div>
		</div>
	);
}

export { AuthStatusIndicator };
