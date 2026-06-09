'use client';

import {
	CalendarDays,
	Clock3,
	Code2,
	Eye,
	FileClock,
	Filter,
	Search,
	ShieldCheck,
	UserRound,
	X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { TablePagination } from '@/components/data/TablePagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/http/api-error';
import { cn } from '@/lib/utils';

import { useAuditLogsQuery } from '../hooks/audit-logs.queries';
import type {
	AuditLogAction,
	AuditLogCategory,
	AuditLogRecord,
} from '../model/audit-logs.model';
import {
	auditLogActionLabels,
	auditLogCategoryLabels,
	auditLogEntityLabels,
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

function entityLabel(entityName: string) {
	return auditLogEntityLabels[entityName] ?? entityName;
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
	const classes: Record<AuditLogAction, string> = {
		CREATE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
		DELETE: 'border-rose-200 bg-rose-50 text-rose-700',
		LOGIN: 'border-sky-200 bg-sky-50 text-sky-700',
		STAGE_CHANGE: 'border-violet-200 bg-violet-50 text-violet-700',
		STATUS_CHANGE: 'border-amber-200 bg-amber-50 text-amber-800',
		UPDATE: 'border-blue-200 bg-blue-50 text-blue-700',
	};
	return classes[action];
}

function getErrorMessage(error: unknown) {
	if (error instanceof ApiError) {
		return error.message;
	}

	return 'Não foi possível carregar os logs de auditoria.';
}

const entityActionText: Record<
	string,
	Partial<Record<AuditLogAction, string>>
> = {
	AccessGroup: {
		CREATE: 'Grupo de acesso criado',
		DELETE: 'Grupo de acesso removido',
		UPDATE: 'Grupo de acesso atualizado',
	},
	Customer: {
		CREATE: 'Cliente criado',
		DELETE: 'Cliente removido',
		UPDATE: 'Cliente atualizado',
	},
	Deal: {
		CREATE: 'Negociação criada',
		DELETE: 'Negociação removida',
		STAGE_CHANGE: 'Etapa da negociação alterada',
		STATUS_CHANGE: 'Status da negociação alterado',
		UPDATE: 'Negociação atualizada',
	},
	Lead: {
		CREATE: 'Lead criado',
		DELETE: 'Lead removido',
		STATUS_CHANGE: 'Status do lead alterado',
		UPDATE: 'Lead atualizado',
	},
	Store: {
		CREATE: 'Loja criada',
		DELETE: 'Loja removida',
		UPDATE: 'Loja atualizada',
	},
	Team: {
		CREATE: 'Equipe criada',
		DELETE: 'Equipe removida',
		UPDATE: 'Equipe atualizada',
	},
	User: {
		CREATE: 'Usuário criado',
		DELETE: 'Usuário removido',
		LOGIN: 'Login realizado',
		UPDATE: 'Usuário atualizado',
	},
	Vehicle: {
		CREATE: 'Veículo criado',
		DELETE: 'Veículo removido',
		STATUS_CHANGE: 'Status do veículo alterado',
		UPDATE: 'Veículo atualizado',
	},
};

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
		entityActionText[log.entityName]?.[log.action] ??
		`${entityLabel(log.entityName)} atualizado`;

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
			<DialogContent className="max-h-[88vh] max-w-4xl overflow-hidden">
				<DialogHeader>
					<DialogTitle>Detalhes do log</DialogTitle>
					<DialogDescription>
						Registro completo da ação capturada pela auditoria.
					</DialogDescription>
				</DialogHeader>

				{log ? (
					<div className="grid max-h-[calc(88vh-9rem)] gap-5 overflow-y-auto px-6 py-5 lg:grid-cols-[0.82fr_1.18fr]">
						<div className="space-y-4">
							<div className="rounded-xl border border-border/80 bg-[#fbfcfe] p-4">
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
										{auditLogActionLabels[log.action]}
									</Badge>
									<Badge
										className="h-7 rounded-md border-[#d7dee8] bg-white px-3 text-[#314155]"
										variant="outline"
									>
										{entityLabel(log.entityName)}
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

						<div className="min-w-0">
							<div className="flex items-center gap-2 border-b border-[#202938] bg-[#111827] px-4 py-3 text-sm font-semibold text-white">
								<Code2 className="size-4" />
								Metadata JSON
							</div>
							<pre className="max-h-[30rem] overflow-auto rounded-b-xl bg-[#0b1020] p-4 font-mono text-xs leading-6 text-[#d8dee9]">
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
		<div className="space-y-3">
			{Array.from({ length: 6 }, (_, index) => (
				<div
					className="rounded-xl border border-border/70 bg-white p-4"
					key={index}
				>
					<div className="flex items-start justify-between gap-4">
						<div className="w-full space-y-3">
							<Skeleton className="h-5 w-44 rounded-md" />
							<Skeleton className="h-4 w-72 rounded-md" />
							<Skeleton className="h-4 w-56 rounded-md" />
						</div>
						<Skeleton className="size-9 rounded-lg" />
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
	const normalizedUserSearch = userSearch.trim();

	const filters = useMemo(
		() => ({
			action,
			category,
			endDate: dateInputToIso(endDate, 'end'),
			limit,
			page,
			startDate: dateInputToIso(startDate, 'start'),
			user: normalizedUserSearch || undefined,
		}),
		[action, category, endDate, limit, normalizedUserSearch, page, startDate],
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
			<div className="flex flex-col gap-4 rounded-2xl border border-border/85 bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
				<div className="flex items-start gap-4">
					<div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#d96c3f]/20 bg-[#d96c3f]/10 text-[#d96c3f]">
						<FileClock className="size-5" />
					</div>
					<div className="min-w-0 space-y-1">
						<p className="text-xs font-semibold tracking-[0.18em] text-[#d96c3f] uppercase">
							Auditoria
						</p>
						<h1 className="text-2xl font-semibold tracking-tight text-[#1b2430]">
							Logs do sistema
						</h1>
						<p className="max-w-3xl text-sm leading-6 text-muted-foreground">
							Consulte a trilha administrativa com filtros por domínio e tipo de
							ação.
						</p>
					</div>
				</div>
			</div>

			<div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
				<aside className="space-y-3 rounded-2xl border border-border/85 bg-white p-3">
					<div className="flex items-center gap-2 px-2 py-1 text-sm font-semibold text-[#1b2430]">
						<Filter className="size-4 text-[#d96c3f]" />
						Categorias
					</div>
					<div className="space-y-1">
						{categoryOptions.map((option) => {
							const isActive = activeCategory === option;
							return (
								<button
									className={cn(
										'flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors',
										isActive
											? 'bg-[#1f2937] text-white'
											: 'text-[#415066] hover:bg-[#f4f6f8]',
									)}
									key={option}
									onClick={() => changeCategory(option)}
									type="button"
								>
									<span className="font-medium">
										{auditLogCategoryLabels[option]}
									</span>
									<span
										className={cn(
											'size-2 rounded-full',
											isActive ? 'bg-[#f07a2a]' : 'bg-[#c9d2df]',
										)}
									/>
								</button>
							);
						})}
					</div>
				</aside>

				<div className="min-w-0 space-y-4">
					<Card className="overflow-hidden rounded-2xl border-border/85 bg-white">
						<CardHeader className="gap-4 border-b border-border/75 pb-5">
							<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
								<div>
									<CardTitle className="text-xl">
										{auditLogCategoryLabels[activeCategory]}
									</CardTitle>
									<CardDescription>
										{activeAction === 'ALL'
											? 'Todas as ações registradas nesta seleção.'
											: auditLogActionLabels[activeAction]}
									</CardDescription>
								</div>

								<div className="flex flex-wrap gap-2">
									{actionOptions.map((option) => (
										<Button
											className={cn(
												'h-9 rounded-lg px-3 text-xs shadow-none',
												activeAction === option
													? 'bg-[#1f2937] text-white hover:bg-[#1f2937]'
													: '',
											)}
											key={option}
											onClick={() => changeAction(option)}
											size="sm"
											variant={activeAction === option ? 'default' : 'outline'}
										>
											{option === 'ALL'
												? 'Todos'
												: auditLogActionLabels[option]}
										</Button>
									))}
								</div>
							</div>
							<div className="grid gap-3 rounded-xl border border-border/75 bg-[#fbfcfe] p-3 md:grid-cols-[minmax(14rem,1.2fr)_minmax(10rem,0.8fr)_minmax(10rem,0.8fr)_auto] md:items-end">
								<label className="min-w-0 space-y-1.5">
									<span className="flex items-center gap-1.5 text-xs font-semibold text-[#415066]">
										<Search className="size-3.5 text-[#d96c3f]" />
										Usuário
									</span>
									<Input
										aria-label="Pesquisar logs por usuário"
										className="h-10 bg-white"
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
										className="h-10 bg-white"
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
										className="h-10 bg-white"
										onChange={(event) => {
											setEndDate(event.target.value);
											setPage(INITIAL_PAGE);
										}}
										type="date"
										value={endDate}
									/>
								</label>
								<Button
									className="h-10 gap-2"
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

						<CardContent className="p-0">
							<div className="min-h-[30rem] bg-[#fbfcfe] p-4">
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
									<div className="space-y-3">
										{logs.map((log) => (
											<article
												className="rounded-xl border border-border/80 bg-white p-4 transition-colors hover:border-[#d96c3f]/35"
												key={log.id}
											>
												<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
													<div className="min-w-0 space-y-3">
														<div className="flex flex-wrap items-center gap-2">
															<Badge
																className={cn(
																	'h-6 rounded-md border px-2.5',
																	actionBadgeClass(log.action),
																)}
															>
																{auditLogActionLabels[log.action]}
															</Badge>
															<Badge
																className="h-6 rounded-md border-[#d7dee8] bg-white px-2.5 text-[#314155]"
																variant="outline"
															>
																{entityLabel(log.entityName)}
															</Badge>
														</div>

														<div>
															<h2 className="text-base font-semibold text-[#1b2430]">
																{auditLogSummary(log)}
															</h2>
														</div>

														<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
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
														className="shrink-0"
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
