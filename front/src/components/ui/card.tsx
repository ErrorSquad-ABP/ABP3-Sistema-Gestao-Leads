import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				'rounded-2xl border border-border bg-card text-card-foreground shadow-none',
				className,
			)}
			data-slot="card"
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				'grid auto-rows-min items-start gap-2 p-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]',
				className,
			)}
			data-slot="card-header"
			{...props}
		/>
	);
}

function CardTitle({
	className,
	...props
}: HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h2
			className={cn(
				'text-2xl font-semibold tracking-tight text-foreground',
				className,
			)}
			data-slot="card-title"
			{...props}
		/>
	);
}

function CardDescription({
	className,
	...props
}: HTMLAttributes<HTMLParagraphElement>) {
	return (
		<p
			className={cn('text-sm leading-6 text-muted-foreground', className)}
			data-slot="card-description"
			{...props}
		/>
	);
}

function CardAction({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
				className,
			)}
			data-slot="card-action"
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn('p-6 pt-0', className)}
			data-slot="card-content"
			{...props}
		/>
	);
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn('flex items-center border-t p-6 pt-4', className)}
			data-slot="card-footer"
			{...props}
		/>
	);
}

export {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
};
