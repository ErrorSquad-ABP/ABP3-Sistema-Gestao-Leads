import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				'rounded-2xl border border-border bg-card text-card-foreground shadow-[0_20px_60px_-28px_rgba(15,23,42,0.2)]',
				className,
			)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('flex flex-col gap-2 p-6', className)} {...props} />;
}

function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h2
			className={cn('text-2xl font-semibold tracking-tight text-foreground', className)}
			{...props}
		/>
	);
}

function CardDescription({
	className,
	...props
}: HTMLAttributes<HTMLParagraphElement>) {
	return (
		<p className={cn('text-sm leading-6 text-muted-foreground', className)} {...props} />
	);
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('p-6 pt-0', className)} {...props} />;
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
