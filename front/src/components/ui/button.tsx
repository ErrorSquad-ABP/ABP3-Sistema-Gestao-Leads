import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow-sm hover:bg-slate-900',
				destructive:
					'bg-destructive/10 text-destructive hover:bg-destructive/20',
				ghost: 'text-foreground hover:bg-slate-50',
				link: 'text-[#D96C3F] underline-offset-4 hover:underline',
				outline:
					'border border-border bg-white text-foreground shadow-sm hover:bg-slate-50',
				secondary:
					'bg-secondary text-secondary-foreground shadow-sm ring-1 ring-border hover:bg-slate-50',
			},
			size: {
				default: 'h-11 px-4 py-2',
				icon: 'size-10 rounded-xl p-0',
				'icon-lg': 'size-11 rounded-2xl p-0',
				'icon-sm': 'size-8 rounded-xl p-0',
				'icon-xs': 'size-7 rounded-lg p-0',
				lg: 'h-12 rounded-xl px-5',
				sm: 'h-9 rounded-md px-3',
				xs: 'h-8 rounded-md px-2.5 text-xs',
			},
		},
		defaultVariants: {
			size: 'default',
			variant: 'default',
		},
	},
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	};

function Button({
	asChild = false,
	className,
	size,
	type = 'button',
	variant,
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot.Root : 'button';

	return (
		<Comp
			className={cn(buttonVariants({ size, variant }), className)}
			data-size={size}
			data-slot="button"
			data-variant={variant}
			type={type}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
