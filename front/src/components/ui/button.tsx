import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground shadow-sm hover:bg-slate-900',
				secondary:
					'bg-secondary text-secondary-foreground shadow-sm ring-1 ring-border hover:bg-slate-50',
				ghost: 'text-foreground hover:bg-slate-50',
			},
			size: {
				default: 'h-11 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-12 rounded-xl px-5',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants>;

function Button({ className, size, variant, type = 'button', ...props }: ButtonProps) {
	return (
		<button
			className={cn(buttonVariants({ size, variant }), className)}
			type={type}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
