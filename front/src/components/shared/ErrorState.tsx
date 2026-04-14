import Link from 'next/link';
import {
	ArrowLeft,
	LockKeyhole,
	RefreshCcw,
	SearchX,
	ShieldAlert,
	ShieldX,
} from 'lucide-react';

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
	label: string;
	href?: string;
	onClick?: () => void;
	variant?: 'default' | 'secondary';
};

type ErrorStateProps = {
	code: 401 | 403 | 404 | 500;
	description: string;
	eyebrow: string;
	primaryAction: ErrorStateAction;
	secondaryAction?: ErrorStateAction;
	technicalDetails?: string;
	title: string;
};

function ErrorState({
	code,
	description,
	eyebrow,
	primaryAction,
	secondaryAction,
	technicalDetails,
	title,
}: ErrorStateProps) {
	const Icon =
		code === 401
			? LockKeyhole
			: code === 403
				? ShieldAlert
				: code === 404
					? SearchX
					: ShieldX;

	function renderAction(action: ErrorStateAction, key: string) {
		const className = cn(
			buttonVariants({
				variant: action.variant ?? 'default',
			}),
			'h-10 rounded-md px-4',
		);

		if (action.href) {
			return (
				<Link className={className} href={action.href} key={key}>
					{action.label}
				</Link>
			);
		}

		return (
			<button
				className={className}
				key={key}
				onClick={action.onClick}
				type="button"
			>
				{action.label}
			</button>
		);
	}

	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,108,63,0.10),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(45,54,72,0.10),transparent_30%)]" />
			<div className="pointer-events-none absolute left-[-8rem] top-[5rem] size-56 rounded-full bg-[#d96c3f]/8 blur-3xl" />
			<div className="pointer-events-none absolute bottom-[-6rem] right-[-4rem] size-72 rounded-full bg-[#2d3648]/10 blur-3xl" />

			<Card className="relative w-full max-w-3xl overflow-hidden border-border/90 bg-white/95 backdrop-blur">
				<div className="h-1.5 w-full bg-[linear-gradient(90deg,#2D3648_0%,#D96C3F_100%)]" />
				<CardHeader className="gap-5 border-b border-border/75 pb-6">
					<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d96c3f]/16 bg-[#F4E6DE] text-[#D96C3F] shadow-[0_16px_34px_-22px_rgba(217,108,63,0.75)]">
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
				<CardContent className="grid gap-5 pt-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.75fr)]">
					<div className="space-y-5">
						<div className="rounded-2xl border border-[#D6DCE5] bg-[#F8FAFB] p-5 text-sm leading-6 text-[#4D5868]">
							<p className="font-medium text-[#1B2430]">Cód. {code}</p>
							<p className="mt-1">
								{code === 401
									? 'A sessão atual não atende aos requisitos mínimos para abrir a rota protegida.'
									: code === 403
										? 'O papel autenticado foi reconhecido, mas não cobre a operação ou área solicitada.'
										: code === 404
											? 'O destino solicitado não existe mais, foi movido ou nunca fez parte do fluxo disponível.'
											: 'A aplicação encontrou uma falha inesperada ao montar ou responder esta tela.'}
							</p>
							{technicalDetails ? (
								<div className="mt-3 rounded-xl border border-border/80 bg-white px-3 py-2.5 text-xs leading-5 text-[#6B7687]">
									<span className="font-medium text-[#1B2430]">
										Detalhe técnico:
									</span>{' '}
									{technicalDetails}
								</div>
							) : null}
						</div>

						<div className="flex flex-wrap gap-3">
							{renderAction(primaryAction, 'primary')}
							{secondaryAction
								? renderAction(secondaryAction, 'secondary')
								: null}
						</div>
					</div>

					<div className="grid gap-3">
						<div className="rounded-2xl border border-border/80 bg-white p-4">
							<div className="inline-flex items-center gap-2 text-sm font-medium text-[#2D3648]">
								<RefreshCcw className="size-4 text-[#D96C3F]" />
								Próximo passo sugerido
							</div>
							<p className="mt-2 text-sm leading-6 text-[#6B7687]">
								{code === 401
									? 'Reinicie a autenticação para obter uma sessão válida antes de seguir no fluxo.'
									: code === 403
										? 'Volte para um destino compatível com o seu papel ou troque de conta.'
										: code === 404
											? 'Retorne para o dashboard ou navegue pela sidebar para encontrar um destino válido.'
											: 'Tente recarregar a tela. Se a falha persistir, registre o erro e siga por outra rota.'}
							</p>
						</div>

						<div className="inline-flex items-center gap-2 text-sm font-medium text-[#2D3648]">
							<ArrowLeft className="size-4" />
							Estados de erro preparados para o App Router e para as rotas
							protegidas do produto.
						</div>
					</div>
				</CardContent>
			</Card>
		</main>
	);
}

export { ErrorState };
