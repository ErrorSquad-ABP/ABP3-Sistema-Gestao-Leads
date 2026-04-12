import { ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { resolveHomeRouteByRole } from '@/lib/auth/session';

import { AppShellNavigation } from './AppShellNavigation';
import { LogoutButton } from './LogoutButton';

type AppShellProps = {
	children: ReactNode;
	user: AuthenticatedUser;
};

const roleLabels: Record<AuthenticatedUser['role'], string> = {
	ADMINISTRATOR: 'Administrador',
	ATTENDANT: 'Atendente',
	GENERAL_MANAGER: 'Gerente geral',
	MANAGER: 'Gerente',
};

function AppShell({ children, user }: AppShellProps) {
	const homeRoute = resolveHomeRouteByRole(user.role);
	const teamLabel = user.teamId
		? `Time vinculado: ${user.teamId}`
		: 'Sem time vinculado';

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(217,108,63,0.12),_transparent_30%),linear-gradient(180deg,#F5F6F8_0%,#EEF2F5_100%)] text-foreground">
			<div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 lg:flex-row lg:gap-4 lg:px-6 lg:py-6">
				<aside className="w-full shrink-0 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[320px]">
					<div className="flex h-full flex-col rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-[0_28px_90px_-40px_rgba(15,23,42,0.35)] backdrop-blur xl:p-5">
						<div className="rounded-[1.6rem] bg-[linear-gradient(135deg,#2D3648_0%,#475166_100%)] p-5 text-white">
							<div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
								<ShieldCheck className="size-5" />
							</div>
							<div className="mt-5 space-y-2">
								<p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white/70">
									Sprint 1
								</p>
								<h1 className="text-xl font-semibold tracking-tight">
									Lead CRM
								</h1>
								<p className="text-sm leading-6 text-white/74">
									Shell autenticado minimo para sustentar dashboards e modulos
									operacionais da sprint.
								</p>
							</div>
						</div>

						<Card className="mt-4 border-white/80 bg-white/90 shadow-none">
							<CardContent className="space-y-3 p-4">
								<div className="flex items-start justify-between gap-4">
									<div className="min-w-0">
										<p className="truncate text-base font-semibold text-foreground">
											{user.name}
										</p>
										<p className="truncate text-sm text-muted-foreground">
											{user.email}
										</p>
									</div>
									<div className="rounded-full border border-[#E9D8CF] bg-[#FFF6F0] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#D96C3F]">
										{roleLabels[user.role]}
									</div>
								</div>
								<p className="rounded-2xl bg-[#F6F8FA] px-3 py-2 text-xs leading-5 text-[#667487]">
									{teamLabel}
								</p>
							</CardContent>
						</Card>

						<div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
							<AppShellNavigation role={user.role} />
						</div>

						<div className="mt-4 grid gap-3">
							<Link
								className="group inline-flex items-center justify-between rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
								href={homeRoute}
							>
								<span>Voltar ao destino inicial</span>
								<ChevronRight className="size-4 text-[#D96C3F] transition-transform group-hover:translate-x-0.5" />
							</Link>
							<LogoutButton />
						</div>
					</div>
				</aside>

				<div className="mt-4 min-w-0 flex-1 lg:mt-0">
					<div className="space-y-4">
						<header className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.35)] backdrop-blur">
							<div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
								<div className="space-y-2">
									<div className="inline-flex items-center gap-2 rounded-full border border-[#E9D8CF] bg-[#FFF7F2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#D96C3F]">
										<Sparkles className="size-3.5" />
										Area protegida ativa
									</div>
									<div>
										<p className="text-sm text-muted-foreground">
											Navegacao autenticada pronta para as US-01 a US-07
										</p>
										<h2 className="text-2xl font-semibold tracking-tight text-foreground">
											Base visual unica para modulos administrativos e
											operacionais
										</h2>
									</div>
								</div>
								<div className="max-w-md rounded-[1.6rem] border border-[#ECE3DD] bg-[linear-gradient(180deg,#FFF9F6_0%,#FFFFFF_100%)] px-4 py-3 text-sm leading-6 text-[#556273]">
									O shell concentra identidade do usuario, navegacao lateral,
									redirecionamento por perfil e saida segura da sessao.
								</div>
							</div>
						</header>

						<main className="rounded-[2rem] border border-white/70 bg-white/55 p-5 shadow-[0_28px_90px_-52px_rgba(15,23,42,0.35)] backdrop-blur xl:p-6">
							{children}
						</main>
					</div>
				</div>
			</div>
		</div>
	);
}

export { AppShell };
