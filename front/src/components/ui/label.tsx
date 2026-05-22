import type { LabelHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

function Label({ className, ...props }: LabelProps) {
	return (
		<label
			className={cn(
				'text-sm leading-none font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
				className,
			)}
			{...props}
		/>
	);
}

export { Label };
