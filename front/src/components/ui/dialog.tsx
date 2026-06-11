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
				'data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 z-50 bg-black/12 duration-100 supports-backdrop-filter:backdrop-blur-xs',
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
	onBlurCapture,
	onInputCapture,
	onInvalidCapture,
	showCloseButton = true,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
	showCloseButton?: boolean;
}) {
	function syncNativeValidity(target: EventTarget, markInvalid = true) {
		if (
			target instanceof HTMLInputElement ||
			target instanceof HTMLSelectElement ||
			target instanceof HTMLTextAreaElement
		) {
			if (target.validity.valid) {
				target.removeAttribute('aria-invalid');
			} else if (markInvalid) {
				target.setAttribute('aria-invalid', 'true');
			}
		}
	}

	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				className={cn(
					'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 gap-0 overflow-hidden rounded-[1.35rem] border border-[#d8e0ea] bg-white text-foreground shadow-[0_20px_70px_rgba(15,23,42,0.18)] duration-200 [&_[aria-invalid=true]]:border-destructive [&_[aria-invalid=true]]:ring-2 [&_[aria-invalid=true]]:ring-destructive/15 [&_input]:rounded-xl [&_select]:rounded-xl [&_textarea]:rounded-xl',
					className,
				)}
				data-slot="dialog-content"
				onBlurCapture={(event) => {
					syncNativeValidity(event.target);
					onBlurCapture?.(event);
				}}
				onInputCapture={(event) => {
					syncNativeValidity(event.target, false);
					onInputCapture?.(event);
				}}
				onInvalidCapture={(event) => {
					syncNativeValidity(event.target);
					onInvalidCapture?.(event);
				}}
				{...props}
			>
				{children}
				{showCloseButton ? (
					<DialogPrimitive.Close asChild>
						<Button
							className="absolute top-4 right-4 z-10 text-[#1b2430] hover:bg-[#f4f6f8]"
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
				'flex flex-col gap-2 border-b border-[#e8edf4] px-6 py-5',
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
				'flex flex-col-reverse gap-3 border-t border-[#e8edf4] bg-white px-6 py-4 sm:flex-row sm:justify-end [&_[data-slot=button]]:h-10 [&_[data-slot=button]]:rounded-xl [&_[data-slot=button]]:px-5 [&_[data-slot=button]]:font-semibold [&_[data-slot=button]]:shadow-none',
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
			className={cn(
				'text-[1.15rem] font-semibold text-[#1b2430]',
				className,
			)}
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
