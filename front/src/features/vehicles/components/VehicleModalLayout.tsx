'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
	Archive,
	CarFront,
	CheckCircle2,
	Clock3,
	Info,
	ShieldCheck,
} from 'lucide-react';

import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { VehicleStatus } from '../model/vehicles.model';
import { formatVehicleStatusLabel } from '../lib/vehicle-labels';

type VehicleModalHeaderProps = {
	description: string;
	icon?: LucideIcon;
	title: string;
};

type VehicleModalInfoBannerProps = {
	actionLabel?: string;
	children: ReactNode;
};

type VehicleModalSectionProps = {
	children: ReactNode;
	className?: string;
	description?: string;
	title: string;
};

type VehicleStatusSummaryProps = {
	status?: VehicleStatus;
};

const vehicleModalContentClass =
	'flex max-h-[92vh] max-w-5xl flex-col overflow-hidden rounded-[1.35rem] border border-[#d8e0ea] bg-white shadow-[0_20px_70px_rgba(15,23,42,0.18)]';

type VehicleStatusSummaryMeta = {
	readonly icon: LucideIcon;
	readonly iconClassName: string;
	readonly subtitle: string;
};

function getVehicleStatusSummaryMeta(
	status: VehicleStatus,
): VehicleStatusSummaryMeta {
	switch (status) {
		case 'AVAILABLE':
			return {
				icon: CheckCircle2,
				iconClassName: 'bg-emerald-100 text-emerald-700',
				subtitle: 'Pronto para venda',
			};
		case 'RESERVED':
			return {
				icon: Clock3,
				iconClassName: 'bg-orange-100 text-orange-700',
				subtitle: 'Em negociação',
			};
		case 'SOLD':
			return {
				icon: ShieldCheck,
				iconClassName: 'bg-violet-100 text-violet-700',
				subtitle: 'Negócio fechado',
			};
		case 'INACTIVE':
			return {
				icon: Archive,
				iconClassName: 'bg-slate-100 text-slate-600',
				subtitle: 'Fora do catálogo',
			};
		default: {
			const _exhaustive: never = status;
			return _exhaustive;
		}
	}
}

function getVehicleStatusSubtitle(status: VehicleStatus) {
	return getVehicleStatusSummaryMeta(status).subtitle;
}

function VehicleModalHeader({
	description,
	icon: Icon = CarFront,
	title,
}: VehicleModalHeaderProps) {
	return (
		<DialogHeader className="border-b-0 px-7 pb-4 pt-7 md:px-8">
			<div className="flex items-start gap-4 pr-10">
				<div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-[#ff5a1f]/10 bg-[#ff5a1f]/10 text-[#ff4f17]">
					<Icon className="size-8" />
				</div>
				<div className="min-w-0 pt-0.5">
					<p className="text-[0.7rem] font-bold uppercase tracking-[0.26em] text-[#ff4f17]">
						Veículos
					</p>
					<DialogTitle className="mt-1 text-2xl font-bold tracking-normal text-[#121a2b]">
						{title}
					</DialogTitle>
					<DialogDescription className="mt-1 max-w-2xl text-sm leading-6 text-[#66708a]">
						{description}
					</DialogDescription>
				</div>
			</div>
		</DialogHeader>
	);
}

function VehicleModalInfoBanner({
	actionLabel,
	children,
}: VehicleModalInfoBannerProps) {
	return (
		<div className="flex items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-sm text-[#506078]">
			<div className="flex min-w-0 items-center gap-3">
				<Info className="size-5 shrink-0 text-blue-600" />
				<p className="leading-6">{children}</p>
			</div>
			{actionLabel ? (
				<Button
					className="h-9 shrink-0 rounded-lg border-blue-200 bg-white px-4 text-xs text-[#1d2a3f] shadow-none hover:bg-blue-50"
					type="button"
					variant="outline"
				>
					{actionLabel}
				</Button>
			) : null}
		</div>
	);
}

function VehicleModalSection({
	children,
	className,
	description,
	title,
}: VehicleModalSectionProps) {
	return (
		<section
			className={cn(
				'rounded-2xl border border-[#dfe7f1] bg-white p-4 md:p-5',
				className,
			)}
		>
			<div className="mb-4 space-y-1">
				<h3 className="text-sm font-bold text-[#1b2537]">{title}</h3>
				{description ? (
					<p className="text-xs leading-5 text-[#6d7890]">{description}</p>
				) : null}
			</div>
			{children}
		</section>
	);
}

function VehicleStatusSummary({ status }: VehicleStatusSummaryProps) {
	const statuses: VehicleStatus[] = [
		'AVAILABLE',
		'RESERVED',
		'SOLD',
		'INACTIVE',
	];

	return (
		<div className="rounded-2xl border border-[#dfe7f1] bg-white p-3">
			<div className="grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_repeat(4,minmax(0,1fr))]">
				<div className="flex items-center gap-3 rounded-xl bg-orange-50/70 px-3 py-2.5">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#ff5a1f]/10 text-[#ff4f17]">
						<CarFront className="size-5" />
					</div>
					<div className="min-w-0">
						<p className="text-sm font-bold text-[#1b2537]">
							Resumo do catálogo
						</p>
						<p className="truncate text-xs text-[#6d7890]">
							Status operacional do veículo no catálogo.
						</p>
					</div>
				</div>

				{statuses.map((item) => {
					const meta = getVehicleStatusSummaryMeta(item);
					const Icon = meta.icon;
					const isSelected = status === item;

					return (
						<div
							className={cn(
								'flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors lg:border-l lg:border-l-[#d8e0ea]',
								isSelected &&
									'border-[#ff8a5c] bg-orange-50 shadow-[0_0_0_1px_rgba(255,90,31,0.16)] lg:border-l-[#ff8a5c]',
							)}
							key={item}
						>
							<div
								className={cn(
									'flex size-9 shrink-0 items-center justify-center rounded-full',
									meta.iconClassName,
								)}
							>
								<Icon className="size-4" />
							</div>
							<div className="min-w-0">
								<p className="truncate text-xs font-bold text-[#1b2537]">
									{formatVehicleStatusLabel(item)}
								</p>
								<p className="truncate text-[0.68rem] text-[#6d7890]">
									{meta.subtitle}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export {
	getVehicleStatusSubtitle,
	VehicleModalHeader,
	VehicleModalInfoBanner,
	VehicleModalSection,
	VehicleStatusSummary,
	vehicleModalContentClass,
};
