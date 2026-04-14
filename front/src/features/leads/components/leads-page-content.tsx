'use client';

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
		<div className="space-y-2 rounded-none border border-border/75 bg-card p-4">
			{SKELETON_ROW_KEYS.map((rowKey) => (
				<Skeleton key={rowKey} className="h-9 w-full" />
			))}
		</div>
	);
}

function LeadsPageContent({ user }: LeadsPageContentProps) {
	const query = useLeadsListQuery(user);
	const { scope, data, isPending, isError, isSuccess, error } = query;
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
			<header className="space-y-1">
				<h1 className="text-lg font-semibold tracking-tight text-foreground">
					{title}
				</h1>
				<p className="text-sm text-muted-foreground">{subtitle}</p>
			</header>

			{scope === null ? (
				<div className="rounded-none border border-border/75 bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
					Esta área não está disponível para o seu perfil.
				</div>
			) : null}

			{scope?.kind === 'none' ? (
				<div className="rounded-none border border-border/75 bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
					Sem equipas com visibilidade para listagem (membro ou gestor).
					Contacte um administrador se precisar de apoio.
				</div>
			) : null}

			{scope !== null && scope.kind !== 'none' ? (
				<>
					{isPending ? <LeadsTableSkeleton /> : null}
					{isError ? (
						<div
							className="rounded-none border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
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
