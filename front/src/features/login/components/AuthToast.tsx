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
				iconClassName: 'text-[#2f6b57]',
			};
		case 'warning':
			return {
				icon: TriangleAlert,
				iconClassName: 'text-[#D96C3F]',
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
		<div className="fixed right-5 top-5 z-40 w-[22rem] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-[#d6dce5] bg-white px-4 py-3 text-sm text-[#6b7687]">
			<div className="flex items-start gap-3">
				<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f5ede8]">
					<Icon aria-hidden="true" className={cn('size-4', iconClassName)} />
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-medium text-[#1b2430]">{title}</p>
					<p className="mt-1 leading-6">{description}</p>
				</div>
				<button
					aria-label="Fechar aviso"
					className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#98a3b2] transition-colors hover:bg-[#f5ede8] hover:text-[#6b7687]"
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
