import type { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

function Input({ className, type, ...props }: InputProps) {
	return (
		<input
			className={cn(
				'flex h-11 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60',
				className,
			)}
			data-slot="input"
			type={type}
			{...props}
		/>
	);
}

export { Input };
