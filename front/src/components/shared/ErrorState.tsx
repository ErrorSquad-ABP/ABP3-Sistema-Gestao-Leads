import Link from 'next/link';
import { ArrowLeft, LockKeyhole, ShieldAlert } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ErrorStateAction = {
	href: string;
	label: string;
	variant?: 'default' | 'secondary';
};

type ErrorStateProps = {
	code: 401 | 403;
	description: string;
	eyebrow: string;
	primaryAction: ErrorStateAction;
	secondaryAction?: ErrorStateAction;
	title: string;
};

function ErrorState({
	code,
	description,
	eyebrow,
	primaryAction,
	secondaryAction,
	title,
}: ErrorStateProps) {
	const Icon = code === 401 ? LockKeyhole : ShieldAlert;

	return (
		<main className="flex min-h-screen items-center justify-center px-4 py-10">
			<Card className="w-full max-w-2xl overflow-hidden bg-white/95 backdrop-blur">
				<div className="h-1.5 w-full bg-[linear-gradient(90deg,#2D3648_0%,#D96C3F_100%)]" />
				<CardHeader className="gap-4">
					<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4E6DE] text-[#D96C3F] shadow-[0_16px_34px_-22px_rgba(217,108,63,0.75)]">
						<Icon className="size-6" />
					</div>
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D96C3F]">
							{eyebrow}
						</p>
						<CardTitle className="text-balance text-[2rem] font-semibold tracking-[-0.04em] text-[#1B2430]">
							{title}
						</CardTitle>
						<CardDescription className="max-w-xl text-sm leading-6 text-[#6B7687]">
							{description}
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="grid gap-5">
					<div className="rounded-2xl border border-[#D6DCE5] bg-[#F8FAFB] p-4 text-sm leading-6 text-[#4D5868]">
						<p className="font-medium text-[#1B2430]">Cód. {code}</p>
						<p className="mt-1">
							O frontend refletiu um estado mínimo de segurança da sessão para
							manter o fluxo mais claro e evitar acesso silencioso a áreas
							protegidas.
						</p>
					</div>

					<div className="flex flex-wrap gap-3">
						<Link
							className={cn(
								buttonVariants({
									variant: primaryAction.variant ?? 'default',
								}),
								'h-10 rounded-md px-4',
							)}
							href={primaryAction.href}
						>
							{primaryAction.label}
						</Link>

						{secondaryAction ? (
							<Link
								className={cn(
									buttonVariants({
										variant: secondaryAction.variant ?? 'secondary',
									}),
									'h-10 rounded-md px-4',
								)}
								href={secondaryAction.href}
							>
								{secondaryAction.label}
							</Link>
						) : null}
					</div>

					<div className="inline-flex items-center gap-2 text-sm font-medium text-[#2D3648]">
						<ArrowLeft className="size-4" />
						Se precisar validar a UI manualmente, abra diretamente `/401` e
						`/403`.
					</div>
				</CardContent>
			</Card>
		</main>
	);
}

export { ErrorState };
