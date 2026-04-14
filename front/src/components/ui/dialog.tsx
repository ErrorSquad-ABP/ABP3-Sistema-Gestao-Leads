'use client';

import type * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function Dialog({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			className={cn(
				'fixed inset-0 z-50 bg-black/12 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
				className,
			)}
			data-slot="dialog-overlay"
			{...props}
		/>
	);
}

function DialogContent({
	children,
	className,
	showCloseButton = true,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
	showCloseButton?: boolean;
}) {
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				className={cn(
					'fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 gap-0 rounded-2xl border border-border/85 bg-white text-foreground shadow-none duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
					className,
				)}
				data-slot="dialog-content"
				{...props}
			>
				{children}
				{showCloseButton ? (
					<DialogPrimitive.Close asChild>
						<Button
							className="absolute right-4 top-4"
							size="icon-sm"
							variant="ghost"
						>
							<XIcon className="size-4" />
							<span className="sr-only">Fechar</span>
						</Button>
					</DialogPrimitive.Close>
				) : null}
			</DialogPrimitive.Content>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'flex flex-col gap-2 border-b border-border/75 px-6 py-5',
				className,
			)}
			data-slot="dialog-header"
			{...props}
		/>
	);
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'flex flex-col-reverse gap-2 border-t border-border/75 bg-white px-6 py-4 sm:flex-row sm:justify-end',
				className,
			)}
			data-slot="dialog-footer"
			{...props}
		/>
	);
}

function DialogTitle({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			className={cn('text-[1.15rem] font-semibold text-[#1b2430]', className)}
			data-slot="dialog-title"
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			className={cn('text-[0.9rem] leading-6 text-[#6b7687]', className)}
			data-slot="dialog-description"
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogTrigger,
	DialogPortal,
	DialogClose,
	DialogOverlay,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};
