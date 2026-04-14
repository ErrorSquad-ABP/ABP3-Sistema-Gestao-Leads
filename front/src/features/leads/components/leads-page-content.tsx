'use client';

import { LayoutList } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { ApiError } from '@/lib/http/api-error';

import { useLeadsListQuery } from '../hooks/leads.queries';
import { LeadsTable } from './LeadsTable';

type LeadsPageContentProps = {
	user: AuthenticatedUser;
};

const SKELETON_ROW_KEYS = ['r0', 'r1', 'r2', 'r3', 'r4', 'r5'] as const;

function LeadsTableSkeleton() {
	return (
		<div className="space-y-2 rounded-2xl border border-border/80 bg-card p-4">
			{SKELETON_ROW_KEYS.map((rowKey) => (
				<Skeleton key={rowKey} className="h-9 w-full" />
			))}
		</div>
	);
}

function LeadsPageContent({ user }: LeadsPageContentProps) {
	const query = useLeadsListQuery(user);
	const {
		scope,
		data,
		isPending,
		isError,
		isSuccess,
		hasPartialFailure,
		error,
	} = query;
	const leads = data ?? [];

	const title = user.role === 'ATTENDANT' ? 'Meus leads' : 'Leads';
	let subtitle = 'Leads do contexto das suas equipas.';
	if (user.role === 'ATTENDANT') {
		subtitle = 'Leads em que é o responsável pela operação.';
	} else if (scope?.kind === 'all') {
		subtitle =
			user.role === 'GENERAL_MANAGER'
				? 'Todos os leads do sistema (vista de gestão geral).'
				: 'Todos os leads do sistema (vista de administrador).';
	} else if (scope?.kind === 'teams') {
		subtitle =
			'Leads agregados das equipas em que é membro ou gestor (sem duplicados).';
	}

	return (
		<div className="space-y-6" aria-busy={isPending ? 'true' : 'false'}>
			<Card className="overflow-hidden rounded-[1.75rem] border-border/90 bg-white">
				<CardHeader className="gap-5 border-none pb-6">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-3">
							<div className="flex size-12 items-center justify-center rounded-2xl border border-[#d96c3f]/16 bg-[#d96c3f]/10 text-[#d96c3f]">
								<LayoutList className="size-5" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
									Workspace
								</p>
								<CardTitle className="text-[1.9rem] font-semibold tracking-tight">
									{title}
								</CardTitle>
								<p className="max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
									{subtitle}
								</p>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pt-0" />
			</Card>

			{scope === null ? (
				<div className="rounded-2xl border border-border/80 bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
					Esta área não está disponível para o seu perfil.
				</div>
			) : null}

			{scope?.kind === 'none' ? (
				<div className="rounded-2xl border border-border/80 bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
					Sem equipas com visibilidade para listagem (membro ou gestor).
					Contacte um administrador se precisar de apoio.
				</div>
			) : null}

			{scope !== null && scope.kind !== 'none' ? (
				<>
					{isPending ? <LeadsTableSkeleton /> : null}
					{hasPartialFailure ? (
						<Alert variant="warning" role="status" aria-live="polite">
							<AlertTitle>Listagem incompleta</AlertTitle>
							<AlertDescription>
								Não foi possível carregar os leads de todas as equipas. A tabela
								mostra apenas os resultados das consultas que responderam com
								sucesso.
								{error instanceof ApiError ? (
									<span className="mt-2 block text-foreground/90">
										Detalhe: {error.message}
									</span>
								) : null}
							</AlertDescription>
						</Alert>
					) : null}
					{isError ? (
						<div
							className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
							role="alert"
							aria-live="polite"
						>
							{error instanceof ApiError
								? error.message
								: 'Não foi possível carregar os leads.'}
						</div>
					) : null}
					{isSuccess ? <LeadsTable leads={leads} /> : null}
				</>
			) : null}
		</div>
	);
}

export { LeadsPageContent };
