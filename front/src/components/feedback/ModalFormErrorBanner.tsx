import { AlertCircle } from 'lucide-react';

type ModalFormErrorBannerProps = {
	readonly message: string | null;
	readonly className?: string;
};

function ModalFormErrorBanner({ message, className }: ModalFormErrorBannerProps) {
	if (!message) {
		return null;
	}

	return (
		<div
			className={
				className ??
				'flex items-start gap-2.5 rounded-md border border-[#f1c7c4] bg-[#fff7f7] px-3 py-2.5 text-[0.82rem] text-[#7a2f2a]'
			}
			role="alert"
		>
			<AlertCircle className="mt-0.5 size-4 shrink-0 text-[#c65a52]" />
			<p className="leading-5">{message}</p>
		</div>
	);
}

export { ModalFormErrorBanner };
