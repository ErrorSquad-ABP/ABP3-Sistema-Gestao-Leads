import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const alertVariants = cva(
	'relative w-full rounded-xl border px-4 py-3 text-sm shadow-sm',
	{
		variants: {
			variant: {
				default: 'border-border bg-white text-foreground',
				destructive:
					'border-destructive/25 bg-red-50 text-foreground',
				warning: 'border-border bg-amber-50 text-foreground',
				success: 'border-border bg-success text-success-foreground',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

type AlertProps = HTMLAttributes<HTMLDivElement> &
	VariantProps<typeof alertVariants>;

function Alert({ className, variant, ...props }: AlertProps) {
	return <div className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
	return <p className={cn('font-semibold', className)} {...props} />;
}

function AlertDescription({
	className,
	...props
}: HTMLAttributes<HTMLParagraphElement>) {
	return <p className={cn('mt-1 leading-6 opacity-90', className)} {...props} />;
}

export { Alert, AlertDescription, AlertTitle };
