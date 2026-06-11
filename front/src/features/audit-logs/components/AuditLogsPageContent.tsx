'use client';

import {
	Building2,
	CalendarDays,
	CarFront,
	Clock3,
	Code2,
	Eye,
	FileClock,
	Filter,
	Handshake,
	KeyRound,
	Search,
	ShieldCheck,
	Store,
	UsersRound,
	UserRound,
	X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { TablePagination } from '@/components/data/TablePagination';
import {
	AppModalHeader,
	appModalContentClass,
} from '@/components/modals/AppModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { humanizePageApiError } from '@/lib/http/humanize-api-error';
import { cn } from '@/lib/utils';

import { useAuditLogsQuery } from '../hooks/audit-logs.queries';
import type {
	AuditLogAction,
	AuditLogCategory,
	AuditLogRecord,
} from '../model/audit-logs.model';
import {
	formatAuditLogEntityLabel,
	getAuditLogActionLabel,
	getAuditLogCategoryLabel,
} from '../model/audit-logs.model';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
const INITIAL_PAGE = 1;
const INITIAL_LIMIT = 20;

const categoryOptions: readonly (AuditLogCategory | 'all')[] = [
	'all',
	'leads',
	'deals',
	'cars',
	'customers',
	'stores',
	'teams',
	'users',
	'access-groups',
];

const actionOptions: readonly (AuditLogAction | 'ALL')[] = [
	'ALL',
	'CREATE',
	'UPDATE',
	'DELETE',
	'STATUS_CHANGE',
	'STAGE_CHANGE',
	'LOGIN',
];

function formatDateTime(date: Date) {
	return new Intl.DateTimeFormat('pt-BR', {
		dateStyle: 'short',
		timeStyle: 'short',
	}).format(date);
}

function stringifyMetadata(metadata: unknown) {
	try {
		return JSON.stringify(metadata ?? null, null, 2);
	} catch {
		return String(metadata);
	}
}

function dateInputToIso(value: string, boundary: 'start' | 'end') {
	if (!value) {
		return undefined;
	}
	const [year, month, day] = value.split('-').map(Number);
	if (!year || !month || !day) {
		return undefined;
	}
	const date =
		boundary === 'start'
			? new Date(year, month - 1, day, 0, 0, 0, 0)
			: new Date(year, month - 1, day, 23, 59, 59, 999);
	return date.toISOString();
}

function actionBadgeClass(action: AuditLogAction) {
	switch (action) {
		case 'CREATE':
			return 'border-emerald-200 bg-emerald-50 text-emerald-700';
		case 'DELETE':
			return 'border-rose-200 bg-rose-50 text-rose-700';
		case 'LOGIN':
			return 'border-sky-200 bg-sky-50 text-sky-700';
		case 'STAGE_CHANGE':
			return 'border-violet-200 bg-violet-50 text-violet-700';
		case 'STATUS_CHANGE':
			return 'border-amber-200 bg-amber-50 text-amber-800';
		case 'UPDATE':
			return 'border-blue-200 bg-blue-50 text-blue-700';
	}
}

function categoryIcon(category: AuditLogCategory | 'all') {
	const className = 'size-4 shrink-0';

	switch (category) {
		case 'all':
		case 'leads':
			return <UsersRound className={className} />;
		case 'access-groups':
			return <KeyRound className={className} />;
		case 'cars':
			return <CarFront className={className} />;
		case 'customers':
		case 'users':
			return <UserRound className={className} />;
		case 'deals':
			return <Handshake className={className} />;
		case 'stores':
			return <Store className={className} />;
		case 'teams':
			return <Building2 className={className} />;
	}
}

function getErrorMessage(error: unknown) {
	return humanizePageApiError(error);
}

const entityActionTextByEntity = new Map<
	string,
	ReadonlyMap<AuditLogAction, string>
>([
	[
		'AccessGroup',
		new Map([
			['CREATE', 'Grupo de acesso criado'],
			['DELETE', 'Grupo de acesso removido'],
			['UPDATE', 'Grupo de acesso atualizado'],
		]),
	],
	[
		'Customer',
		new Map([
			['CREATE', 'Cliente criado'],
			['DELETE', 'Cliente removido'],
			['UPDATE', 'Cliente atualizado'],
		]),
	],
	[
		'Deal',
		new Map([
			['CREATE', 'Negociação criada'],
			['DELETE', 'Negociação removida'],
			['STAGE_CHANGE', 'Etapa da negociação alterada'],
			['STATUS_CHANGE', 'Status da negociação alterado'],
			['UPDATE', 'Negociação atualizada'],
		]),
	],
	[
		'Lead',
		new Map([
			['CREATE', 'Lead criado'],
			['DELETE', 'Lead removido'],
			['STATUS_CHANGE', 'Status do lead alterado'],
			['UPDATE', 'Lead atualizado'],
		]),
	],
	[
		'Store',
		new Map([
			['CREATE', 'Loja criada'],
			['DELETE', 'Loja removida'],
			['UPDATE', 'Loja atualizada'],
		]),
	],
	[
		'Team',
		new Map([
			['CREATE', 'Equipe criada'],
			['DELETE', 'Equipe removida'],
			['UPDATE', 'Equipe atualizada'],
		]),
	],
	[
		'User',
		new Map([
			['CREATE', 'Usuário criado'],
			['DELETE', 'Usuário removido'],
			['LOGIN', 'Login realizado'],
			['UPDATE', 'Usuário atualizado'],
		]),
	],
	[
		'Vehicle',
		new Map([
			['CREATE', 'Veículo criado'],
			['DELETE', 'Veículo removido'],
			['STATUS_CHANGE', 'Status do veículo alterado'],
			['UPDATE', 'Veículo atualizado'],
		]),
	],
]);

function getEntityActionText(
	entityName: string,
	action: AuditLogAction,
): string | undefined {
	return entityActionTextByEntity.get(entityName)?.get(action);
}

function actorDescription(log: AuditLogRecord) {
	if (!log.actor) {
		return 'pelo sistema';
	}

	if (log.actor.role === 'ADMINISTRATOR') {
		return 'pelo administrador';
	}

	return `pelo usuário ${log.actor.name}`;
}

function auditLogSummary(log: AuditLogRecord) {
	if (log.action === 'LOGIN') {
		return log.actor
			? `Login realizado por ${log.actor.name}`
			: 'Login realizado';
	}

	const actionText =
		getEntityActionText(log.entityName, log.action) ??
		`${formatAuditLogEntityLabel(log.entityName)} atualizado`;

	return `${actionText} ${actorDescription(log)}`;
}

type AuditLogDetailsDialogProps = {
	log: AuditLogRecord | null;
	onClose: () => void;
	open: boolean;
};

function AuditLogDetailsDialog({
	log,
	onClose,
	open,
}: AuditLogDetailsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
			<DialogContent className={`${appModalContentClass} max-w-4xl`}>
				<AppModalHeader
					category="Auditoria"
					description="Registro completo da ação capturada pela auditoria."
					icon={FileClock}
					title="Detalhes do log"
					tone="violet"
				/>

				{log ? (
					<div className="grid max-h-[calc(88vh-9rem)] gap-5 overflow-y-auto px-6 py-5 lg:grid-cols-[0.82fr_1.18fr]">
						<div className="space-y-4">
							<div className="rounded-xl border border-border/80 bg-white p-4">
								<p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
									Ação
								</p>
								<div className="mt-3 flex flex-wrap items-center gap-2">
									<Badge
										className={cn(
											'h-7 rounded-md border px-3',
											actionBadgeClass(log.action),
										)}
									>
										{getAuditLogActionLabel(log.action)}
									</Badge>
									<Badge
										className="h-7 rounded-md border-[#d7dee8] bg-white px-3 text-[#314155]"
										variant="outline"
									>
										{formatAuditLogEntityLabel(log.entityName)}
									</Badge>
								</div>
							</div>

							<div className="grid gap-3 rounded-xl border border-border/80 bg-white p-4 text-sm">
								<div>
									<p className="text-xs font-medium text-muted-foreground">
										Autor
									</p>
									<p className="mt-1 font-semibold text-[#1b2430]">
										{log.actor?.name ?? 'Sistema'}
									</p>
									<p className="text-xs text-muted-foreground">
										{log.actor?.email ??
											log.actorUserId ??
											'Sem usuário vinculado'}
									</p>
								</div>
								<div>
									<p className="text-xs font-medium text-muted-foreground">
										Data
									</p>
									<p className="mt-1 font-semibold text-[#1b2430]">
										{formatDateTime(log.createdAt)}
									</p>
								</div>
								<div>
									<p className="text-xs font-medium text-muted-foreground">
										ID da entidade
									</p>
									<p className="mt-1 font-mono text-xs break-all text-[#415066]">
										{log.entityId ?? 'Não informado'}
									</p>
								</div>
								<div>
									<p className="text-xs font-medium text-muted-foreground">
										ID do log
									</p>
									<p className="mt-1 font-mono text-xs break-all text-[#415066]">
										{log.id}
									</p>
								</div>
							</div>
						</div>

						<div className="min-w-0 overflow-hidden rounded-xl border border-[#e8edf4]">
							<div className="flex items-center gap-2 border-b border-[#e8edf4] bg-white px-4 py-3 text-sm font-semibold text-[#1b2430]">
								<Code2 className="size-4" />
								Metadata JSON
							</div>
							<pre className="max-h-[30rem] overflow-auto bg-white p-4 font-mono text-xs leading-6 text-[#506078]">
								<code>{stringifyMetadata(log.metadata)}</code>
							</pre>
						</div>
					</div>
				) : null}
			</DialogContent>
		</Dialog>
	);
}

function AuditLogSkeletonList() {
	return (
		<div className="space-y-2">
			{Array.from({ length: 6 }, (_, index) => (
				<div
					className="rounded-xl border border-[#e2e8f0] bg-white px-5 py-4"
					key={index}
				>
					<div className="flex items-start justify-between gap-4">
						<div className="w-full space-y-2.5">
							<Skeleton className="h-5 w-36 rounded-full" />
							<Skeleton className="h-4 w-72 rounded-md" />
							<Skeleton className="h-3.5 w-56 rounded-md" />
						</div>
						<Skeleton className="h-9 w-28 rounded-lg" />
					</div>
				</div>
			))}
		</div>
	);
}

function AuditLogsPageContent() {
	const [category, setCategory] = useState<AuditLogCategory | undefined>();
	const [action, setAction] = useState<AuditLogAction | undefined>();
	const [userSearch, setUserSearch] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [page, setPage] = useState(INITIAL_PAGE);
	const [limit, setLimit] = useState(INITIAL_LIMIT);
	const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);
	const debouncedUserSearch = useDebouncedValue(userSearch.trim(), 300);

	const filters = useMemo(
		() => ({
			action,
			category,
			endDate: dateInputToIso(endDate, 'end'),
			limit,
			page,
			startDate: dateInputToIso(startDate, 'start'),
			user: debouncedUserSearch || undefined,
		}),
		[action, category, debouncedUserSearch, endDate, limit, page, startDate],
	);
	const query = useAuditLogsQuery(filters);
	const pageData = query.data;
	const logs = pageData?.items ?? [];
	const totalItems = pageData?.total ?? 0;
	const totalPages = pageData?.totalPages ?? 0;
	const activeCategory = category ?? 'all';
	const activeAction = action ?? 'ALL';

	function changeCategory(nextCategory: AuditLogCategory | 'all') {
		setCategory(nextCategory === 'all' ? undefined : nextCategory);
		setPage(INITIAL_PAGE);
	}

	function changeAction(nextAction: AuditLogAction | 'ALL') {
		setAction(nextAction === 'ALL' ? undefined : nextAction);
		setPage(INITIAL_PAGE);
	}

	function clearAdvancedFilters() {
		setUserSearch('');
		setStartDate('');
		setEndDate('');
		setPage(INITIAL_PAGE);
	}

	return (
		<section className="space-y-5">
			<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
				<div className="flex items-start gap-4">
					<div className="hidden">
						<FileClock className="size-5" />
					</div>
					<div className="min-w-0 space-y-1">
						<p className="hidden">Auditoria</p>
						<h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
							Logs do sistema
						</h1>
						<p className="max-w-3xl text-sm leading-6 text-muted-foreground">
							Consulte a trilha administrativa com filtros por domínio e tipo de
							ação.
						</p>
					</div>
				</div>
			</div>

			<div className="grid items-start gap-5 xl:min-h-[calc(100dvh-8rem)] xl:grid-cols-[17.5rem_minmax(0,1fr)]">
				<aside className="overflow-hidden rounded-2xl border border-[#dde5ef] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.035)] xl:sticky xl:top-5 xl:flex xl:h-[calc(100dvh-8rem)] xl:flex-col">
					<div className="flex items-center gap-2 border-b border-[#e7edf5] px-5 py-4 text-sm font-semibold text-[#172033]">
						<Filter className="size-4 text-[color:var(--brand-accent)]" />
						Categorias
					</div>
					<div className="space-y-1 overflow-y-auto p-3">
						{categoryOptions.map((option) => {
							const isActive = activeCategory === option;
							return (
								<button
									className={cn(
										'group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors',
										isActive
											? 'bg-[color:var(--brand-accent-soft)] text-[#172033]'
											: 'text-[#172033] hover:bg-[#f6f8fb]',
									)}
									key={option}
									onClick={() => changeCategory(option)}
									type="button"
								>
									<span
										className={cn(
											'flex size-8 items-center justify-center rounded-lg border transition-colors',
											isActive
												? 'border-[color:var(--brand-accent)]/20 bg-white text-[color:var(--brand-accent)]'
												: 'border-transparent bg-[#f6f8fb] text-[#64748b] group-hover:bg-white',
										)}
									>
										{categoryIcon(option)}
									</span>
									<span className="min-w-0 flex-1 truncate font-medium">
										{getAuditLogCategoryLabel(option)}
									</span>
									<span
										className={cn(
											'size-1.5 rounded-full',
											isActive
												? 'bg-[color:var(--brand-accent)]'
												: 'bg-[#d5dde8]',
										)}
									/>
								</button>
							);
						})}
					</div>
				</aside>

				<div className="min-w-0 space-y-4">
					<Card className="contents">
						<CardHeader className="gap-4 rounded-2xl border border-[#dde5ef] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
							<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
								<div>
									<CardTitle className="text-base font-semibold text-[#172033]">
										Tipo de ação
									</CardTitle>
									<CardDescription>
										{getAuditLogCategoryLabel(activeCategory)}
										{' · '}
										{activeAction === 'ALL'
											? 'Todas as ações registradas nesta seleção.'
											: getAuditLogActionLabel(activeAction)}
									</CardDescription>
								</div>

								<div className="flex flex-wrap gap-2">
									{actionOptions.map((option) => (
										<Button
											className={cn(
												'h-8 rounded-full border-[#d8e1ec] px-4 text-xs shadow-none',
												activeAction === option
													? 'border-[#172033] bg-[#172033] text-white hover:bg-[#172033]'
													: 'bg-white text-[#415066] hover:bg-[#f6f8fb]',
											)}
											key={option}
											onClick={() => changeAction(option)}
											size="sm"
											variant={activeAction === option ? 'default' : 'outline'}
										>
											{option === 'ALL'
												? 'Todos'
												: getAuditLogActionLabel(option)}
										</Button>
									))}
								</div>
							</div>
							<p className="border-t border-[#e7edf5] pt-4 text-sm font-semibold text-[#172033]">
								Filtros avançados
							</p>
							<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(14rem,1.2fr)_minmax(10rem,0.8fr)_minmax(10rem,0.8fr)_auto] xl:items-end">
								<label className="min-w-0 space-y-1.5">
									<span className="flex items-center gap-1.5 text-xs font-semibold text-[#415066]">
										<Search className="size-3.5 text-[#d96c3f]" />
										Usuário
									</span>
									<Input
										aria-label="Pesquisar logs por usuário"
										className="h-10 rounded-xl border-[#d8e1ec] bg-white shadow-none"
										onChange={(event) => {
											setUserSearch(event.target.value);
											setPage(INITIAL_PAGE);
										}}
										placeholder="Nome, e-mail ou ID"
										value={userSearch}
									/>
								</label>
								<label className="min-w-0 space-y-1.5">
									<span className="flex items-center gap-1.5 text-xs font-semibold text-[#415066]">
										<CalendarDays className="size-3.5 text-[#d96c3f]" />
										De
									</span>
									<Input
										aria-label="Data inicial dos logs"
										className="h-10 rounded-xl border-[#d8e1ec] bg-white shadow-none"
										onChange={(event) => {
											setStartDate(event.target.value);
											setPage(INITIAL_PAGE);
										}}
										type="date"
										value={startDate}
									/>
								</label>
								<label className="min-w-0 space-y-1.5">
									<span className="flex items-center gap-1.5 text-xs font-semibold text-[#415066]">
										<CalendarDays className="size-3.5 text-[#d96c3f]" />
										Até
									</span>
									<Input
										aria-label="Data final dos logs"
										className="h-10 rounded-xl border-[#d8e1ec] bg-white shadow-none"
										onChange={(event) => {
											setEndDate(event.target.value);
											setPage(INITIAL_PAGE);
										}}
										type="date"
										value={endDate}
									/>
								</label>
								<Button
									className="h-10 gap-2 rounded-xl border-[#d8e1ec] px-5 shadow-none"
									disabled={!userSearch && !startDate && !endDate}
									onClick={clearAdvancedFilters}
									type="button"
									variant="outline"
								>
									<X className="size-4" />
									Limpar
								</Button>
							</div>
						</CardHeader>

						<CardContent className="contents">
							<div className="min-h-[30rem]">
								{query.isLoading ? <AuditLogSkeletonList /> : null}

								{query.isError ? (
									<div
										className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
										role="alert"
									>
										{getErrorMessage(query.error)}
									</div>
								) : null}

								{query.isSuccess && logs.length === 0 ? (
									<div className="flex min-h-[20rem] items-center justify-center rounded-xl border border-dashed border-border bg-white px-4 text-center">
										<div className="max-w-sm space-y-2">
											<ShieldCheck className="mx-auto size-8 text-[#d96c3f]" />
											<p className="font-semibold text-[#1b2430]">
												Nenhum log encontrado
											</p>
											<p className="text-sm leading-6 text-muted-foreground">
												Ajuste os filtros ou consulte todas as categorias para
												ampliar a busca.
											</p>
										</div>
									</div>
								) : null}

								{query.isSuccess && logs.length > 0 ? (
									<div className="space-y-2">
										{logs.map((log) => (
											<article
												className="rounded-xl border border-[#e1e8f0] bg-white px-5 py-3.5 transition-colors hover:border-[color:var(--brand-accent)]/35 hover:bg-[#fffdfc]"
												key={log.id}
											>
												<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
													<div className="min-w-0 space-y-2">
														<div className="flex flex-wrap items-center gap-2">
															<Badge
																className={cn(
																	'h-5 rounded-full border px-2.5 text-[11px]',
																	actionBadgeClass(log.action),
																)}
															>
																{getAuditLogActionLabel(log.action)}
															</Badge>
															<Badge
																className="h-5 rounded-full border-[#d7dee8] bg-white px-2.5 text-[11px] text-[#314155]"
																variant="outline"
															>
																{formatAuditLogEntityLabel(log.entityName)}
															</Badge>
														</div>

														<div>
															<h2 className="text-sm font-semibold text-[#172033]">
																{auditLogSummary(log)}
															</h2>
														</div>

														<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#667085]">
															<span className="inline-flex items-center gap-1.5">
																<UserRound className="size-3.5" />
																{log.actor?.name ?? 'Sistema'}
															</span>
															<span className="inline-flex items-center gap-1.5">
																<Clock3 className="size-3.5" />
																{formatDateTime(log.createdAt)}
															</span>
														</div>
													</div>

													<Button
														className="h-9 shrink-0 rounded-lg border-[#d8e1ec] px-4 shadow-none"
														onClick={() => setSelectedLog(log)}
														size="sm"
														variant="outline"
													>
														<Eye className="size-4" />
														Inspecionar
													</Button>
												</div>
											</article>
										))}
									</div>
								) : null}
							</div>

							<TablePagination
								className="mt-4 rounded-2xl border border-[#dde5ef] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.035)]"
								isLoading={query.isFetching}
								itemLabel="logs"
								onPageChange={setPage}
								onPageSizeChange={(nextLimit) => {
									setLimit(nextLimit);
									setPage(INITIAL_PAGE);
								}}
								page={page}
								pageSize={limit}
								pageSizeOptions={PAGE_SIZE_OPTIONS}
								totalItems={totalItems}
								totalPages={totalPages}
							/>
						</CardContent>
					</Card>
				</div>
			</div>

			<AuditLogDetailsDialog
				log={selectedLog}
				onClose={() => setSelectedLog(null)}
				open={selectedLog !== null}
			/>
		</section>
	);
}

export { AuditLogsPageContent };
