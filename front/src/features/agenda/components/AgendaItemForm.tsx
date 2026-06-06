import { type FormEvent, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fetchLeadCatalog } from '@/features/leads/api/leads.service';
import type { LeadCatalogItem } from '@/features/leads/model/leads.model';

import type {
	AgendaItem,
	AgendaItemStatus,
	AgendaItemType,
	AgendaLeadSummary,
	AgendaRecurrence,
	CreateAgendaItemPayload,
} from '../model/agenda.model';

type AgendaItemFormMode = 'create' | 'edit';

type AgendaItemFormValues = CreateAgendaItemPayload & {
	status?: AgendaItemStatus;
};

type Props = {
	initialDate?: Date;
	initialLead?: AgendaLeadSummary | null;
	isSubmitting: boolean;
	item?: AgendaItem | null;
	mode: AgendaItemFormMode;
	onCancel: () => void;
	onSubmit: (payload: AgendaItemFormValues) => void;
};

const LEAD_SEARCH_LIMIT = 5;
const DEFAULT_TASK_DUE_HOUR = 9;
const DEFAULT_EVENT_START_HOUR = 9;
const DEFAULT_EVENT_END_HOUR = 10;
const RECURRENCE_OPTIONS: readonly {
	label: string;
	value: AgendaRecurrence;
}[] = [
	{ label: 'Não se repete', value: 'NONE' },
	{ label: 'Diária', value: 'DAILY' },
	{ label: 'Semanal', value: 'WEEKLY' },
	{ label: 'Mensal', value: 'MONTHLY' },
];

const STATUS_OPTIONS: readonly {
	label: string;
	value: AgendaItemStatus;
}[] = [
	{ label: 'Agendado', value: 'SCHEDULED' },
	{ label: 'Concluído', value: 'DONE' },
	{ label: 'Cancelado', value: 'CANCELLED' },
];

function localDateTimeToIso(value: string) {
	if (!value) {
		return null;
	}
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toDateTimeLocalValue(date: Date, hour: number) {
	const next = new Date(date);
	next.setHours(hour, 0, 0, 0);
	const year = next.getFullYear();
	const month = String(next.getMonth() + 1).padStart(2, '0');
	const day = String(next.getDate()).padStart(2, '0');
	const hours = String(next.getHours()).padStart(2, '0');
	const minutes = String(next.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function isoToDateTimeLocalValue(value: string | null | undefined) {
	if (!value) {
		return '';
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return '';
	}
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function buildInitialState(item: AgendaItem | null | undefined, date: Date) {
	return {
		description: item?.description ?? '',
		dueAt:
			item?.type === 'TASK' && item.dueAt
				? isoToDateTimeLocalValue(item.dueAt)
				: toDateTimeLocalValue(date, DEFAULT_TASK_DUE_HOUR),
		endsAt:
			item?.type === 'EVENT' && item.endsAt
				? isoToDateTimeLocalValue(item.endsAt)
				: toDateTimeLocalValue(date, DEFAULT_EVENT_END_HOUR),
		location: item?.location ?? '',
		recurrence: item?.recurrence ?? 'NONE',
		startsAt:
			item?.type === 'EVENT' && item.startsAt
				? isoToDateTimeLocalValue(item.startsAt)
				: toDateTimeLocalValue(date, DEFAULT_EVENT_START_HOUR),
		status: item?.status ?? 'SCHEDULED',
		title: item?.title ?? '',
		type: item?.type ?? 'TASK',
	} satisfies {
		description: string;
		dueAt: string;
		endsAt: string;
		location: string;
		recurrence: AgendaRecurrence;
		startsAt: string;
		status: AgendaItemStatus;
		title: string;
		type: AgendaItemType;
	};
}

function toAgendaLeadSummary(lead: LeadCatalogItem): AgendaLeadSummary {
	return {
		id: lead.lead.id,
		customerName: lead.customer.name,
		status: lead.lead.status,
	};
}

function AgendaItemForm({
	initialDate = new Date(),
	initialLead = null,
	isSubmitting,
	item = null,
	mode,
	onCancel,
	onSubmit,
}: Props) {
	const [state, setState] = useState(() =>
		buildInitialState(item, initialDate),
	);
	const [leadSearch, setLeadSearch] = useState(
		item?.lead?.customerName ?? initialLead?.customerName ?? '',
	);
	const [leadResults, setLeadResults] = useState<LeadCatalogItem[]>([]);
	const [isLeadSearchLoading, setIsLeadSearchLoading] = useState(false);
	const [hasSearchedLead, setHasSearchedLead] = useState(false);
	const [leadSearchError, setLeadSearchError] = useState<string | null>(null);
	const [selectedLead, setSelectedLead] = useState<AgendaLeadSummary | null>(
		item?.lead ?? initialLead,
	);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setState(buildInitialState(item, initialDate));
		setLeadSearch(item?.lead?.customerName ?? initialLead?.customerName ?? '');
		setSelectedLead(item?.lead ?? initialLead);
		setLeadResults([]);
		setHasSearchedLead(false);
		setLeadSearchError(null);
		setError(null);
	}, [initialDate, initialLead, item]);

	function patchState(next: Partial<typeof state>) {
		setState((current) => ({ ...current, ...next }));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const normalizedTitle = state.title.trim();
		if (!normalizedTitle) {
			setError('Informe um título.');
			return;
		}
		if (state.type === 'EVENT' && !state.startsAt) {
			setError('Informe o início do compromisso.');
			return;
		}
		if (state.type === 'EVENT' && state.endsAt) {
			const startsAt = localDateTimeToIso(state.startsAt);
			const endsAt = localDateTimeToIso(state.endsAt);
			if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
				setError('O fim deve ser posterior ao início.');
				return;
			}
		}

		setError(null);
		onSubmit({
			type: state.type,
			status: mode === 'edit' ? state.status : undefined,
			title: normalizedTitle,
			description: state.description.trim() || null,
			location: state.location.trim() || null,
			leadId: selectedLead?.id ?? null,
			recurrence: state.recurrence,
			startsAt:
				state.type === 'EVENT' ? localDateTimeToIso(state.startsAt) : null,
			endsAt: state.type === 'EVENT' ? localDateTimeToIso(state.endsAt) : null,
			dueAt: state.type === 'TASK' ? localDateTimeToIso(state.dueAt) : null,
		});
	}

	async function handleLeadSearch() {
		const search = leadSearch.trim();
		if (search.length < 2) {
			return;
		}
		setIsLeadSearchLoading(true);
		setHasSearchedLead(true);
		setLeadSearchError(null);
		try {
			const response = await fetchLeadCatalog({
				search,
				page: 1,
				limit: LEAD_SEARCH_LIMIT,
			});
			setLeadResults(response.items);
		} catch {
			setLeadSearchError('Não foi possível buscar leads agora.');
		} finally {
			setIsLeadSearchLoading(false);
		}
	}

	return (
		<form className="grid gap-4" onSubmit={handleSubmit}>
			<div className="grid gap-3 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="agenda-type">Tipo</Label>
					<select
						className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
						id="agenda-type"
						onChange={(event) =>
							patchState({ type: event.target.value as AgendaItemType })
						}
						value={state.type}
					>
						<option value="TASK">Tarefa</option>
						<option value="EVENT">Compromisso</option>
					</select>
				</div>
				{mode === 'edit' ? (
					<div className="space-y-2">
						<Label htmlFor="agenda-status">Status</Label>
						<select
							className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
							id="agenda-status"
							onChange={(event) =>
								patchState({
									status: event.target.value as AgendaItemStatus,
								})
							}
							value={state.status}
						>
							{STATUS_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>
				) : null}
				<div className="space-y-2">
					<Label htmlFor="agenda-recurrence">Repetição</Label>
					<select
						className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
						id="agenda-recurrence"
						onChange={(event) =>
							patchState({
								recurrence: event.target.value as AgendaRecurrence,
							})
						}
						value={state.recurrence}
					>
						{RECURRENCE_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="agenda-title">Título</Label>
				<Input
					id="agenda-title"
					maxLength={120}
					onChange={(event) => patchState({ title: event.target.value })}
					required
					value={state.title}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="agenda-lead-search">Lead vinculado</Label>
				<div className="flex flex-col gap-2 sm:flex-row">
					<Input
						id="agenda-lead-search"
						onChange={(event) => setLeadSearch(event.target.value)}
						placeholder="Buscar por cliente ou lead"
						value={leadSearch}
					/>
					<Button
						disabled={leadSearch.trim().length < 2 || isSubmitting}
						onClick={handleLeadSearch}
						type="button"
						variant="outline"
					>
						Buscar
					</Button>
				</div>
				{selectedLead ? (
					<div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
						<span>
							Lead selecionado: <strong>{selectedLead.customerName}</strong>
						</span>
						<Button
							onClick={() => {
								setSelectedLead(null);
								setLeadSearch('');
								setLeadResults([]);
								setHasSearchedLead(false);
							}}
							size="sm"
							type="button"
							variant="ghost"
						>
							Remover
						</Button>
					</div>
				) : null}
				{isLeadSearchLoading ? (
					<p className="text-xs text-muted-foreground">Buscando leads...</p>
				) : null}
				{leadSearchError ? (
					<p className="text-xs text-destructive" role="alert">
						{leadSearchError}
					</p>
				) : null}
				{leadResults.length > 0 ? (
					<div className="grid gap-2">
						{leadResults.map((lead) => {
							const summary = toAgendaLeadSummary(lead);
							return (
								<button
									className="rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
									key={summary.id}
									onClick={() => {
										setSelectedLead(summary);
										setLeadSearch(summary.customerName);
									}}
									type="button"
								>
									<span className="font-medium">{summary.customerName}</span>
									<span className="block text-xs text-muted-foreground">
										{lead.store.name}
										{lead.owner ? ` · ${lead.owner.name}` : ''}
									</span>
								</button>
							);
						})}
					</div>
				) : null}
				{hasSearchedLead && !isLeadSearchLoading && leadResults.length === 0 ? (
					<p className="text-xs text-muted-foreground">
						Nenhum lead encontrado para a busca.
					</p>
				) : null}
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				{state.type === 'EVENT' ? (
					<>
						<div className="space-y-2">
							<Label htmlFor="agenda-starts-at">Início</Label>
							<Input
								id="agenda-starts-at"
								onChange={(event) =>
									patchState({ startsAt: event.target.value })
								}
								required
								type="datetime-local"
								value={state.startsAt}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="agenda-ends-at">Fim</Label>
							<Input
								id="agenda-ends-at"
								onChange={(event) => patchState({ endsAt: event.target.value })}
								type="datetime-local"
								value={state.endsAt}
							/>
						</div>
					</>
				) : (
					<div className="space-y-2">
						<Label htmlFor="agenda-due-at">Prazo</Label>
						<Input
							id="agenda-due-at"
							onChange={(event) => patchState({ dueAt: event.target.value })}
							type="datetime-local"
							value={state.dueAt}
						/>
					</div>
				)}
				<div className="space-y-2">
					<Label htmlFor="agenda-location">Local</Label>
					<Input
						id="agenda-location"
						maxLength={160}
						onChange={(event) => patchState({ location: event.target.value })}
						value={state.location}
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="agenda-description">Descrição</Label>
				<Textarea
					id="agenda-description"
					maxLength={2000}
					onChange={(event) => patchState({ description: event.target.value })}
					value={state.description}
				/>
			</div>

			{error ? (
				<p className="text-sm text-destructive" role="alert">
					{error}
				</p>
			) : null}

			<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
				<Button
					disabled={isSubmitting}
					onClick={onCancel}
					type="button"
					variant="outline"
				>
					Cancelar
				</Button>
				<Button disabled={isSubmitting} type="submit">
					Salvar
				</Button>
			</div>
		</form>
	);
}

export { AgendaItemForm, isoToDateTimeLocalValue, localDateTimeToIso };
export type { AgendaItemFormMode, AgendaItemFormValues };
