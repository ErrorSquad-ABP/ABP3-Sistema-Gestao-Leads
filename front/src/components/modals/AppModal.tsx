'use client';

import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type ModalTone = 'brand' | 'danger' | 'info' | 'success' | 'violet' | 'warning';

const toneClasses = {
	brand:
		'border-[color:var(--brand-accent)]/10 bg-[color:var(--brand-accent-soft)]/55 text-[color:var(--brand-accent)]',
	danger: 'border-red-100 bg-red-50 text-red-600',
	info: 'border-blue-100 bg-blue-50 text-blue-600',
	success: 'border-emerald-100 bg-emerald-50 text-emerald-600',
	violet: 'border-violet-100 bg-violet-50 text-violet-600',
	warning: 'border-amber-100 bg-amber-50 text-amber-600',
} as const satisfies Record<ModalTone, string>;

const toneTextClasses = {
	brand: 'text-[color:var(--brand-accent)]',
	danger: 'text-red-600',
	info: 'text-blue-600',
	success: 'text-emerald-600',
	violet: 'text-violet-600',
	warning: 'text-amber-600',
} as const satisfies Record<ModalTone, string>;

function getToneClasses(tone: ModalTone): string {
	switch (tone) {
		case 'brand':
			return toneClasses.brand;
		case 'danger':
			return toneClasses.danger;
		case 'info':
			return toneClasses.info;
		case 'success':
			return toneClasses.success;
		case 'violet':
			return toneClasses.violet;
		case 'warning':
			return toneClasses.warning;
	}
}

function getToneTextClass(tone: ModalTone): string {
	switch (tone) {
		case 'brand':
			return toneTextClasses.brand;
		case 'danger':
			return toneTextClasses.danger;
		case 'info':
			return toneTextClasses.info;
		case 'success':
			return toneTextClasses.success;
		case 'violet':
			return toneTextClasses.violet;
		case 'warning':
			return toneTextClasses.warning;
	}
}

const appModalContentClass =
	'flex max-h-[92vh] flex-col overflow-hidden rounded-[1.35rem] border border-[#d8e0ea] bg-white p-0 shadow-[0_20px_70px_rgba(15,23,42,0.18)]';

const appModalPrimaryButtonClass =
	'h-10 rounded-xl bg-[#101a33] px-5 font-semibold text-white shadow-none hover:bg-[#17223d]';

const appModalSecondaryButtonClass =
	'h-10 rounded-xl px-5 font-semibold shadow-none';

type AppModalHeaderProps = {
	category: string;
	description: ReactNode;
	icon: LucideIcon;
	title: ReactNode;
	tone?: ModalTone;
};

function AppModalHeader({
	category,
	description,
	icon: Icon,
	title,
	tone = 'brand',
}: AppModalHeaderProps) {
	return (
		<DialogHeader className="border-b border-[#e8edf4] px-6 py-5 sm:px-8 sm:py-6">
			<div className="flex items-start gap-4 pr-8">
				<div
					className={cn(
						'flex size-12 shrink-0 items-center justify-center rounded-2xl border',
						getToneClasses(tone),
					)}
				>
					<Icon className="size-6" />
				</div>
				<div className="min-w-0 space-y-1">
					<p
						className={cn(
							'text-[0.68rem] font-bold tracking-[0.3em] uppercase',
							getToneTextClass(tone),
						)}
					>
						{category}
					</p>
					<DialogTitle className="text-[1.35rem] leading-tight font-bold tracking-[-0.02em] text-[#1b2430]">
						{title}
					</DialogTitle>
					<DialogDescription className="max-w-2xl text-[13px] leading-5 text-[#7a8494]">
						{description}
					</DialogDescription>
				</div>
			</div>
		</DialogHeader>
	);
}

function AppModalBody({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 sm:px-8',
				className,
			)}
			{...props}
		/>
	);
}

function AppModalFooter({ className, ...props }: ComponentProps<'div'>) {
	return (
		<DialogFooter
			className={cn(
				'shrink-0 gap-3 border-t border-[#e8edf4] bg-white px-6 py-4 sm:px-8',
				className,
			)}
			{...props}
		/>
	);
}

type AppModalSectionProps = ComponentProps<'section'> & {
	description?: ReactNode;
	icon?: LucideIcon;
	title?: ReactNode;
	tone?: ModalTone;
};

function AppModalSection({
	children,
	className,
	description,
	icon: Icon,
	title,
	tone = 'brand',
	...props
}: AppModalSectionProps) {
	return (
		<section
			className={cn(
				'rounded-2xl border border-[#dfe7f1] bg-white p-4 sm:p-5',
				className,
			)}
			{...props}
		>
			{title ? (
				<div className="mb-4 flex items-start gap-3">
					{Icon ? (
						<span
							className={cn(
								'flex size-9 shrink-0 items-center justify-center rounded-xl border',
								getToneClasses(tone),
							)}
						>
							<Icon className="size-4" />
						</span>
					) : null}
					<div className="space-y-0.5">
						<h3 className="text-sm font-bold text-[#1b2537]">{title}</h3>
						{description ? (
							<p className="text-xs leading-5 text-[#6d7890]">{description}</p>
						) : null}
					</div>
				</div>
			) : null}
			{children}
		</section>
	);
}

type AppModalInfoBannerProps = ComponentProps<'div'> & {
	icon: LucideIcon;
	tone?: ModalTone;
};

function AppModalInfoBanner({
	children,
	className,
	icon: Icon,
	tone = 'info',
	...props
}: AppModalInfoBannerProps) {
	return (
		<div
			className={cn(
				'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6',
				getToneClasses(tone),
				className,
			)}
			{...props}
		>
			<Icon className="mt-0.5 size-5 shrink-0" />
			<div className="min-w-0 text-[#506078]">{children}</div>
		</div>
	);
}

type AppModalConfirmPanelProps = ComponentProps<'div'> & {
	icon: LucideIcon;
	tone?: ModalTone;
};

function AppModalConfirmPanel({
	children,
	className,
	icon: Icon,
	tone = 'danger',
	...props
}: AppModalConfirmPanelProps) {
	return (
		<div
			className={cn(
				'flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm',
				getToneClasses(tone),
				className,
			)}
			{...props}
		>
			<Icon className="mt-0.5 size-5 shrink-0" />
			<div className="min-w-0 text-[#1b2430]">{children}</div>
		</div>
	);
}

function AppModalCancelButton({
	className,
	...props
}: ComponentProps<typeof Button>) {
	return (
		<Button
			className={cn(appModalSecondaryButtonClass, className)}
			variant="outline"
			{...props}
		/>
	);
}

function AppModalPrimaryButton({
	className,
	...props
}: ComponentProps<typeof Button>) {
	return (
		<Button className={cn(appModalPrimaryButtonClass, className)} {...props} />
	);
}

export {
	AppModalBody,
	AppModalCancelButton,
	AppModalConfirmPanel,
	AppModalFooter,
	AppModalHeader,
	AppModalInfoBanner,
	AppModalPrimaryButton,
	AppModalSection,
	appModalContentClass,
	appModalPrimaryButtonClass,
	appModalSecondaryButtonClass,
};
