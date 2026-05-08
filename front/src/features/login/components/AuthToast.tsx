'use client';

import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useEffect } from 'react';

import { cn } from '@/lib/utils';

type AuthToastVariant = 'default' | 'success' | 'warning';

type AuthToastProps = {
	description: string;
	onClose: () => void;
	title: string;
	variant?: AuthToastVariant;
};

function getToastVisuals(variant: AuthToastVariant) {
	switch (variant) {
		case 'success':
			return {
				icon: CheckCircle2,
				iconClassName: 'text-emerald-700',
			};
		case 'warning':
			return {
				icon: TriangleAlert,
				iconClassName: 'text-[color:var(--brand-accent)]',
			};
		default:
			return {
				icon: Info,
				iconClassName: 'text-slate-700',
			};
	}
}

function AuthToast({
	description,
	onClose,
	title,
	variant = 'default',
}: AuthToastProps) {
	useEffect(() => {
		const timeoutId = window.setTimeout(onClose, 4800);

		return () => window.clearTimeout(timeoutId);
	}, [onClose]);

	const { icon: Icon, iconClassName } = getToastVisuals(variant);

	return (
		<div className="fixed right-5 top-5 z-40 w-[22rem] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
			<div className="flex items-start gap-3">
				<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-accent-soft)]">
					<Icon aria-hidden="true" className={cn('size-4', iconClassName)} />
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-medium text-foreground">{title}</p>
					<p className="mt-1 leading-6">{description}</p>
				</div>
				<button
					aria-label="Fechar aviso"
					className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[color:var(--brand-accent-soft)] hover:text-foreground"
					onClick={onClose}
					type="button"
				>
					<X aria-hidden="true" className="size-4" />
				</button>
			</div>
		</div>
	);
}

export { AuthToast };
