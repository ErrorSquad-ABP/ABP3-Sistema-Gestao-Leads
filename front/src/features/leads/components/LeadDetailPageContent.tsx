'use client';

import { useRouter } from 'next/navigation';
import {
	ArrowLeft,
	Building2,
	CheckCheck,
	Clock3,
	Handshake,
	LayoutList,
	Mail,
	PencilLine,
	Phone,
	Shuffle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LeadDealsDialog } from '@/features/deals/components/LeadDealsDialog';
import {
	formatDealHistoryFieldName,
	formatDealHistoryValueDisplay,
	formatDealStageLabel,
	formatDealStatusLabel,
	formatDealValueBRL,
} from '@/features/deals/lib/deal-labels';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { ApiError, isApiError } from '@/lib/http/api-error';
import { appRoutes } from '@/lib/routes/app-routes';
import {
	useLeadCustomersQuery,
	useLeadOwnersQuery,
	useLeadStoresQuery,
} from '../hooks/leads.catalog.queries';
import { useLeadDetailHubQuery } from '../hooks/leads.queries';
import {
	useConvertLeadMutation,
	useReassignLeadMutation,
	useUpdateLeadMutation,
} from '../hooks/leads.mutations';
import {
	formatLeadSourceLabel,
	formatLeadStatusLabel,
	getLeadSourceBadgeClass,
} from '../lib/lead-list-labels';
import type {
	CreateLeadInput,
	LeadDetailHub,
	LeadListItem,
	ReassignLeadInput,
	UpdateLeadInput,
} from '../model/leads.model';
import {
	buildOwnerOptions,
	getLeadsErrorMessage,
	LeadConfirmDialog,
	LeadFormDialog,
	LeadReassignDialog,
} from './LeadForm';

type LeadDetailPageContentProps = {
	leadId: string;
	user: AuthenticatedUser;
};

type TimelineEvent = LeadDetailHub['timeline'][number];

const TIMELINE_PAGE_SIZE = 10;

const timelineFieldOptions = [
	{ value: 'all', label: 'Todos os registros' },
	{ value: 'IMPORTANCE', label: 'Importância' },
	{ value: 'STATUS', label: 'Status' },
	{ value: 'TITLE', label: 'Título' },
	{ value: 'STAGE', label: 'Etapa' },
	{ value: 'VALUE', label: 'Valor' },
	{ value: 'RESPONSIBLE', label: 'Responsável' },
	{ value: 'SOURCE', label: 'Origem' },
	{ value: 'INTEREST', label: 'Interesse' },
	{ value: 'CREATED', label: 'Criação' },
	{ value: 'CONVERTED', label: 'Conversão' },
];

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
	dateStyle: 'short',
	timeStyle: 'short',
});

function formatDate(value: string) {
	return dateFormatter.format(new Date(value));
}

function formatPhone(value: string | null) {
	if (!value) {
		return 'Telefone não informado';
	}
	const digits = value.replace(/\D/g, '');
	if (digits.length === 11) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
	}
	if (digits.length === 10) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
	}
	return value;
}

function buildLeadListTarget(data: LeadDetailHub): LeadListItem {
	return {
		id: data.lead.id,
		customerId: data.customer.id,
		storeId: data.store.id,
		ownerUserId: data.owner?.id ?? null,
		source: data.lead.source,
		status: data.lead.status,
	};
}

function asRecord(value: unknown): Record<string, unknown> | null {
	if (value === null || typeof value !== 'object' || Array.isArray(value)) {
		return null;
	}
	return value as Record<string, unknown>;
}

function onlyString(value: unknown) {
	return typeof value === 'string' ? value : null;
}

function timelineDateKey(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value.slice(0, 10);
	}
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function formatLeadChangeFieldName(field: string) {
	if (field === 'ownerUserId') return 'Responsável';
	if (field === 'source') return 'Origem';
	if (field === 'status') return 'Estado';
	if (field === 'vehicleInterestText') return 'Interesse';
	return field;
}

function formatLeadChangeValue(field: string, raw: string | null) {
	if (raw === null || raw === '') {
		return '—';
	}
	if (field === 'status') {
		return formatLeadStatusLabel(raw);
	}
	if (field === 'source') {
		return formatLeadSourceLabel(raw);
	}
	return raw;
}

function getTimelineChangeRecords(event: TimelineEvent) {
	const metadata = asRecord(event.metadata);
	const changes = Array.isArray(metadata?.changes) ? metadata.changes : [];
	return changes
		.map((change) => asRecord(change))
		.filter((change): change is Record<string, unknown> => change !== null);
}

function getTimelineFieldKeys(event: TimelineEvent) {
	if (event.type === 'CREATED') {
		return ['CREATED'];
	}
	if (event.type === 'CONVERTED') {
		return ['CONVERTED'];
	}
	if (event.type === 'REASSIGNED') {
		return ['RESPONSIBLE'];
	}
	if (event.type === 'DEAL_UPDATED') {
		const field = onlyString(asRecord(event.metadata)?.field);
		return field ? [field.toUpperCase()] : [];
	}
	return getTimelineChangeRecords(event)
		.map((change) => {
			const field = onlyString(change.field);
			if (field === 'ownerUserId') return 'RESPONSIBLE';
			if (field === 'source') return 'SOURCE';
			if (field === 'vehicleInterestText') return 'INTEREST';
			return field?.toUpperCase() ?? null;
		})
		.filter((field): field is string => field !== null);
}

function formatTimelineDescription(event: TimelineEvent) {
	if (event.type === 'DEAL_UPDATED' && event.metadata) {
		const field =
			typeof event.metadata.field === 'string' ? event.metadata.field : '';
		const fromValue =
			typeof event.metadata.fromValue === 'string'
				? event.metadata.fromValue
				: null;
		const toValue =
			typeof event.metadata.toValue === 'string'
				? event.metadata.toValue
				: null;
		return `${formatDealHistoryFieldName(field)} alterado de ${formatDealHistoryValueDisplay(
			field,
			fromValue,
		)} para ${formatDealHistoryValueDisplay(field, toValue)}.`;
	}
	if (event.type === 'REASSIGNED') {
		const metadata = asRecord(event.metadata);
		const fromOwner = asRecord(metadata?.fromOwner);
		const toOwner = asRecord(metadata?.toOwner);
		const fromName = onlyString(fromOwner?.name) ?? 'Sem responsável';
		const toName = onlyString(toOwner?.name) ?? 'Sem responsável';
		return `Responsável alterado de ${fromName} para ${toName}.`;
	}
	return event.description;
}

function formatTimelineOwner(owner: Record<string, unknown> | null) {
	const name = onlyString(owner?.name);
	const email = onlyString(owner?.email);
	if (!name || !email) {
		return 'Sem responsável';
	}
	return `${name} · ${email}`;
}

function getTimelineDetails(event: TimelineEvent) {
	const details: { label: string; value: string }[] = [
		{ label: 'Registro', value: event.title },
		{ label: 'Data', value: formatDate(event.createdAt) },
	];
	if (event.actor) {
		details.push({
			label: 'Responsável pela ação',
			value: `${event.actor.name} · ${event.actor.email}`,
		});
	}
	if (event.type === 'DEAL_UPDATED') {
		const metadata = asRecord(event.metadata);
		const field = onlyString(metadata?.field) ?? '';
		details.push(
			{ label: 'Campo alterado', value: formatDealHistoryFieldName(field) },
			{
				label: 'Valor anterior',
				value: formatDealHistoryValueDisplay(
					field,
					onlyString(metadata?.fromValue),
				),
			},
			{
				label: 'Novo valor',
				value: formatDealHistoryValueDisplay(
					field,
					onlyString(metadata?.toValue),
				),
			},
		);
		return details;
	}
	if (event.type === 'REASSIGNED') {
		const metadata = asRecord(event.metadata);
		const fromOwner = asRecord(metadata?.fromOwner);
		const toOwner = asRecord(metadata?.toOwner);
		details.push(
			{
				label: 'Responsável anterior',
				value: formatTimelineOwner(fromOwner),
			},
			{
				label: 'Novo responsável',
				value: formatTimelineOwner(toOwner),
			},
		);
		return details;
	}
	for (const change of getTimelineChangeRecords(event)) {
		const field = onlyString(change.field) ?? '';
		const fromLabel = onlyString(change.fromLabel);
		const toLabel = onlyString(change.toLabel);
		details.push(
			{ label: 'Campo alterado', value: formatLeadChangeFieldName(field) },
			{
				label: 'Valor anterior',
				value:
					fromLabel ??
					formatLeadChangeValue(field, onlyString(change.fromValue)),
			},
			{
				label: 'Novo valor',
				value:
					toLabel ?? formatLeadChangeValue(field, onlyString(change.toValue)),
			},
		);
	}
	if (details.length === (event.actor ? 3 : 2)) {
		details.push({ label: 'Descrição', value: event.description });
	}
	return details;
}

function timelineMatchesText(event: TimelineEvent, search: string) {
	if (!search.trim()) {
		return true;
	}
	const needle = search.trim().toLowerCase();
	const haystack = [
		event.title,
		event.description,
		formatTimelineDescription(event),
		event.actor?.name,
		event.actor?.email,
		...getTimelineDetails(event).flatMap((detail) => [
			detail.label,
			detail.value,
		]),
	]
		.filter((value): value is string => Boolean(value))
		.join(' ')
		.toLowerCase();
	return haystack.includes(needle);
}

function DetailMetric({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-2xl border border-border/80 bg-[#f8fafc] px-4 py-3">
			<p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
				{label}
			</p>
			<p className="mt-1 text-sm font-medium text-[#1b2430]">{value}</p>
		</div>
	);
}

function LeadDetailPageContent({ leadId, user }: LeadDetailPageContentProps) {
	const router = useRouter();
	const detailQuery = useLeadDetailHubQuery(leadId, {
		enabled: Boolean(leadId),
	});
	const customersQuery = useLeadCustomersQuery();
	const storesQuery = useLeadStoresQuery();
	const ownersQuery = useLeadOwnersQuery();
	const updateLeadMutation = useUpdateLeadMutation();
	const reassignLeadMutation = useReassignLeadMutation();
	const convertLeadMutation = useConvertLeadMutation();

	const [editOpen, setEditOpen] = useState(false);
	const [reassignOpen, setReassignOpen] = useState(false);
	const [convertOpen, setConvertOpen] = useState(false);
	const [dealsOpen, setDealsOpen] = useState(false);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [timelineSearch, setTimelineSearch] = useState('');
	const [timelineField, setTimelineField] = useState('all');
	const [timelineStartDate, setTimelineStartDate] = useState('');
	const [timelineEndDate, setTimelineEndDate] = useState('');
	const [timelinePage, setTimelinePage] = useState(1);
	const [selectedTimelineEvent, setSelectedTimelineEvent] =
		useState<TimelineEvent | null>(null);

	const detail = detailQuery.data;
	const targetLead = useMemo(
		() => (detail ? buildLeadListTarget(detail) : null),
		[detail],
	);
	const customers = useMemo(
		() => customersQuery.data ?? [],
		[customersQuery.data],
	);
	const stores = useMemo(() => storesQuery.data ?? [], [storesQuery.data]);
	const owners = useMemo(() => ownersQuery.data ?? [], [ownersQuery.data]);
	const ownerOptions = targetLead
		? buildOwnerOptions({
				leadOwners: owners,
				selectedStoreId: targetLead.storeId,
			})
		: [];
	const filteredTimeline = useMemo(() => {
		const events = detail?.timeline ?? [];
		return events.filter((event) => {
			const eventDate = timelineDateKey(event.createdAt);
			if (timelineStartDate && eventDate < timelineStartDate) {
				return false;
			}
			if (timelineEndDate && eventDate > timelineEndDate) {
				return false;
			}
			if (
				timelineField !== 'all' &&
				!getTimelineFieldKeys(event).includes(timelineField)
			) {
				return false;
			}
			return timelineMatchesText(event, timelineSearch);
		});
	}, [
		detail?.timeline,
		timelineEndDate,
		timelineField,
		timelineSearch,
		timelineStartDate,
	]);
	const timelineTotalPages = Math.max(
		1,
		Math.ceil(filteredTimeline.length / TIMELINE_PAGE_SIZE),
	);
	const safeTimelinePage = Math.min(timelinePage, timelineTotalPages);
	const visibleTimeline = filteredTimeline.slice(
		(safeTimelinePage - 1) * TIMELINE_PAGE_SIZE,
		safeTimelinePage * TIMELINE_PAGE_SIZE,
	);
	const selectedTimelineDetails = selectedTimelineEvent
		? getTimelineDetails(selectedTimelineEvent)
		: [];

	function resetTimelinePage() {
		setTimelinePage(1);
	}

	function clearTimelineFilters() {
		setTimelineSearch('');
		setTimelineField('all');
		setTimelineStartDate('');
		setTimelineEndDate('');
		setTimelinePage(1);
	}

	async function handleEditSubmit(values: CreateLeadInput | UpdateLeadInput) {
		if (!targetLead) return;
		setDialogError(null);
		try {
			await updateLeadMutation.mutateAsync({
				leadId: targetLead.id,
				payload: values as UpdateLeadInput,
			});
			setEditOpen(false);
		} catch (error) {
			setDialogError(getLeadsErrorMessage(error));
		}
	}

	async function handleReassignSubmit(values: ReassignLeadInput) {
		if (!targetLead) return;
		setDialogError(null);
		try {
			await reassignLeadMutation.mutateAsync({
				leadId: targetLead.id,
				payload: values,
			});
			setReassignOpen(false);
		} catch (error) {
			setDialogError(getLeadsErrorMessage(error));
		}
	}

	async function handleConvertConfirm() {
		if (!targetLead) return;
		setDialogError(null);
		try {
			await convertLeadMutation.mutateAsync(targetLead.id);
			setConvertOpen(false);
		} catch (error) {
			setDialogError(getLeadsErrorMessage(error));
		}
	}

	if (detailQuery.isPending) {
		return (
			<div className="space-y-6">
				<div className="rounded-[1.75rem] border border-border/80 bg-white px-6 py-8 text-sm text-[#6b7687]">
					Carregando informações do lead...
				</div>
			</div>
		);
	}

	if (detailQuery.isError || !detail) {
		return (
			<div className="space-y-6">
				<Button
					className="rounded-md shadow-none"
					onClick={() => router.push(appRoutes.app.leads)}
					type="button"
					variant="outline"
				>
					<ArrowLeft className="size-4" />
					Voltar para leads
				</Button>
				<div
					className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					<p>
						{detailQuery.error instanceof ApiError
							? detailQuery.error.message
							: 'Não foi possível carregar as informações do lead.'}
					</p>
					<Button
						className="mt-3 rounded-md shadow-none"
						onClick={() => void detailQuery.refetch()}
						type="button"
						variant="outline"
					>
						Tentar novamente
					</Button>
				</div>
			</div>
		);
	}

	const ownerLabel = detail.owner
		? `${detail.owner.name} · ${detail.owner.email}`
		: 'Sem responsável';
	const catalogError =
		customersQuery.error ?? storesQuery.error ?? ownersQuery.error ?? null;

	return (
		<div className="space-y-6">
			<Button
				className="rounded-md shadow-none"
				onClick={() => router.push(appRoutes.app.leads)}
				type="button"
				variant="outline"
			>
				<ArrowLeft className="size-4" />
				Voltar para leads
			</Button>

			<Card className="overflow-hidden rounded-[1.75rem] border-border/90 bg-white">
				<CardHeader className="gap-5 border-none pb-6">
					<div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
						<div className="space-y-3">
							<div className="flex size-12 items-center justify-center rounded-2xl border border-[#d96c3f]/16 bg-[#d96c3f]/10 text-[#d96c3f]">
								<LayoutList className="size-5" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
									Hub de atendimento
								</p>
								<CardTitle className="text-[1.9rem] font-semibold tracking-tight">
									{detail.customer.name}
								</CardTitle>
								<p className="max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
									Acompanhe o atendimento, o responsável, as negociações e os
									próximos passos deste lead em um só lugar.
								</p>
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button
								className="rounded-md shadow-none"
								disabled={!detail.permissions.canReassign}
								onClick={() => setReassignOpen(true)}
								type="button"
								variant="outline"
							>
								<Shuffle className="size-4" />
								Reatribuir
							</Button>
							<Button
								className="rounded-md shadow-none bg-[#2D3648] hover:bg-[#232B3B]"
								disabled={!detail.permissions.canManageDeals}
								onClick={() => setDealsOpen(true)}
								title={
									detail.permissions.canManageDeals
										? undefined
										: 'Você não tem permissão para alterar negociações deste lead.'
								}
								type="button"
							>
								<Handshake className="size-4" />
								Negociações
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-3 pt-0 md:grid-cols-2 xl:grid-cols-4">
					<DetailMetric
						label="Estado"
						value={formatLeadStatusLabel(detail.lead.status)}
					/>
					<DetailMetric
						label="Origem"
						value={formatLeadSourceLabel(detail.lead.source)}
					/>
					<DetailMetric label="Loja" value={detail.store.name} />
					<DetailMetric label="Responsável" value={ownerLabel} />
				</CardContent>
			</Card>

			{catalogError ? (
				<div
					className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					{isApiError(catalogError)
						? catalogError.message
						: 'Não foi possível carregar as opções para as ações deste lead.'}
				</div>
			) : null}

			<div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
				<Card className="rounded-[1.75rem] border-border/90 bg-white">
					<CardHeader>
						<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
							Contexto
						</p>
						<CardTitle>Cliente e operação</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-3">
							<div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-[#f8fafc] px-4 py-3 text-sm text-[#1b2430]">
								<Mail className="size-4 text-[#6b7687]" />
								{detail.customer.email ?? 'E-mail não informado'}
							</div>
							<div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-[#f8fafc] px-4 py-3 text-sm text-[#1b2430]">
								<Phone className="size-4 text-[#6b7687]" />
								{formatPhone(detail.customer.phone)}
							</div>
							<div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-[#f8fafc] px-4 py-3 text-sm text-[#1b2430]">
								<Building2 className="size-4 text-[#6b7687]" />
								{detail.store.name}
							</div>
						</div>
						<div className="rounded-2xl border border-border/80 px-4 py-4">
							<p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
								Interesse
							</p>
							<p className="mt-2 text-sm text-[#1b2430]">
								{detail.lead.vehicleInterestText ??
									'Nenhum interesse em veículo foi informado.'}
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button
								className="rounded-md shadow-none"
								disabled={!detail.permissions.canEdit}
								onClick={() => setEditOpen(true)}
								type="button"
								variant="outline"
							>
								<PencilLine className="size-4" />
								Editar lead
							</Button>
							<Button
								className="rounded-md shadow-none"
								disabled={!detail.permissions.canConvert}
								onClick={() => setConvertOpen(true)}
								type="button"
								variant="outline"
							>
								<CheckCheck className="size-4" />
								Converter
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-[1.75rem] border-border/90 bg-white">
					<CardHeader>
						<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
							Timeline
						</p>
						<CardTitle>Histórico do atendimento</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="grid gap-3 rounded-2xl border border-border/80 bg-white p-3 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="timeline-search">Buscar no histórico</Label>
								<Input
									id="timeline-search"
									onChange={(event) => {
										setTimelineSearch(event.target.value);
										resetTimelinePage();
									}}
									placeholder="Título, status, valor, responsável..."
									value={timelineSearch}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="timeline-field">Tipo de alteração</Label>
								<select
									className="h-10 w-full rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
									id="timeline-field"
									onChange={(event) => {
										setTimelineField(event.target.value);
										resetTimelinePage();
									}}
									value={timelineField}
								>
									{timelineFieldOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="timeline-start-date">Data inicial</Label>
								<Input
									id="timeline-start-date"
									onChange={(event) => {
										setTimelineStartDate(event.target.value);
										resetTimelinePage();
									}}
									type="date"
									value={timelineStartDate}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="timeline-end-date">Data final</Label>
								<Input
									id="timeline-end-date"
									onChange={(event) => {
										setTimelineEndDate(event.target.value);
										resetTimelinePage();
									}}
									type="date"
									value={timelineEndDate}
								/>
							</div>
							<div className="flex items-center justify-between gap-3 sm:col-span-2">
								<p className="text-xs text-[#6b7687]">
									Mostrando {visibleTimeline.length} de{' '}
									{filteredTimeline.length} registros encontrados.
								</p>
								<Button
									className="rounded-md shadow-none"
									onClick={clearTimelineFilters}
									type="button"
									variant="outline"
								>
									Limpar filtros
								</Button>
							</div>
						</div>
						{detail.timeline.length === 0 ? (
							<div className="rounded-2xl border border-border/80 bg-[#f8fafc] px-4 py-6 text-sm text-[#6b7687]">
								Nenhum registro encontrado para este lead.
							</div>
						) : null}
						{detail.timeline.length > 0 && filteredTimeline.length === 0 ? (
							<div className="rounded-2xl border border-border/80 bg-[#f8fafc] px-4 py-6 text-sm text-[#6b7687]">
								Nenhum registro encontrado com os filtros aplicados.
							</div>
						) : null}
						{visibleTimeline.map((event) => (
							<div
								className="rounded-2xl border border-border/80 bg-[#f8fafc] px-4 py-3"
								key={event.id}
							>
								<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div className="space-y-2">
										<p className="text-sm font-medium text-[#1b2430]">
											{event.title}
										</p>
										<p className="text-sm text-[#6b7687]">
											{formatTimelineDescription(event)}
										</p>
										{event.actor ? (
											<p className="text-xs text-[#6b7687]">
												Por {event.actor.name} · {event.actor.email}
											</p>
										) : null}
									</div>
									<div className="flex items-center gap-2 text-xs text-[#6b7687]">
										<Clock3 className="size-3.5" />
										{formatDate(event.createdAt)}
									</div>
								</div>
								<div className="mt-3 flex justify-end">
									<Button
										className="rounded-md shadow-none"
										onClick={() => setSelectedTimelineEvent(event)}
										type="button"
										variant="outline"
									>
										Ver detalhes
									</Button>
								</div>
							</div>
						))}
						{filteredTimeline.length > TIMELINE_PAGE_SIZE ? (
							<div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
								<p className="text-xs text-[#6b7687]">
									Página {safeTimelinePage} de {timelineTotalPages}
								</p>
								<div className="flex gap-2">
									<Button
										className="rounded-md shadow-none"
										disabled={safeTimelinePage <= 1}
										onClick={() =>
											setTimelinePage((current) => Math.max(1, current - 1))
										}
										type="button"
										variant="outline"
									>
										Anterior
									</Button>
									<Button
										className="rounded-md shadow-none"
										disabled={safeTimelinePage >= timelineTotalPages}
										onClick={() =>
											setTimelinePage((current) =>
												Math.min(timelineTotalPages, current + 1),
											)
										}
										type="button"
										variant="outline"
									>
										Próxima
									</Button>
								</div>
							</div>
						) : null}
					</CardContent>
				</Card>
			</div>

			<Card className="rounded-[1.75rem] border-border/90 bg-white">
				<CardHeader>
					<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
						Negociação
					</p>
					<CardTitle>Resumo de negociações</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{detail.deals.length === 0 ? (
						<div className="rounded-2xl border border-border/80 bg-[#f8fafc] px-4 py-6 text-sm text-[#6b7687]">
							Nenhuma negociação vinculada a este lead.
						</div>
					) : null}
					{detail.deals.map((deal) => (
						<div
							className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-[#f8fafc] px-4 py-3 md:flex-row md:items-center md:justify-between"
							key={deal.id}
						>
							<div>
								<p className="text-sm font-medium text-[#1b2430]">
									{deal.title}
								</p>
								<p className="text-sm text-[#6b7687]">{deal.vehicleLabel}</p>
							</div>
							<div className="flex flex-wrap gap-2">
								<Badge variant="outline">
									{formatDealStageLabel(deal.stage)}
								</Badge>
								<Badge variant="outline">
									{formatDealStatusLabel(deal.status)}
								</Badge>
								<Badge
									className={`rounded-md border px-2.5 py-1 text-[0.72rem] font-medium ${getLeadSourceBadgeClass(detail.lead.source)}`}
									variant="outline"
								>
									{formatDealValueBRL(deal.value)}
								</Badge>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			<Dialog
				onOpenChange={(open) => {
					if (!open) {
						setSelectedTimelineEvent(null);
					}
				}}
				open={selectedTimelineEvent !== null}
			>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{selectedTimelineEvent?.title ?? 'Detalhes do histórico'}
						</DialogTitle>
						<DialogDescription>
							Informações completas do registro selecionado no histórico do
							atendimento.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3 px-6 py-5">
						{selectedTimelineDetails.map((detailItem) => (
							<div
								className="rounded-2xl border border-border/80 bg-[#f8fafc] px-4 py-3"
								key={`${detailItem.label}-${detailItem.value}`}
							>
								<p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
									{detailItem.label}
								</p>
								<p className="mt-1 text-sm text-[#1b2430]">
									{detailItem.value}
								</p>
							</div>
						))}
					</div>
					<DialogFooter>
						<Button
							className="rounded-md shadow-none"
							onClick={() => setSelectedTimelineEvent(null)}
							type="button"
							variant="outline"
						>
							Fechar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<LeadFormDialog
				key={`lead-detail-edit-${targetLead?.id ?? 'none'}`}
				customers={customers}
				isPending={updateLeadMutation.isPending}
				mode="edit"
				onClose={() => {
					setEditOpen(false);
					setDialogError(null);
				}}
				onSubmit={handleEditSubmit}
				open={editOpen}
				owners={owners}
				stores={stores}
				targetLead={targetLead}
				user={user}
			/>

			<LeadReassignDialog
				key={`lead-detail-reassign-${targetLead?.id ?? 'none'}`}
				currentOwnerLabel={ownerLabel}
				isPending={reassignLeadMutation.isPending}
				onClose={() => {
					setReassignOpen(false);
					setDialogError(null);
				}}
				onSubmit={handleReassignSubmit}
				open={reassignOpen}
				ownerOptions={ownerOptions}
				targetLead={targetLead}
				user={user}
			/>

			<LeadConfirmDialog
				confirmLabel="Confirmar conversão"
				description="O lead selecionado será marcado como convertido."
				error={dialogError}
				icon="convert"
				isPending={convertLeadMutation.isPending}
				onClose={() => {
					setConvertOpen(false);
					setDialogError(null);
				}}
				onConfirm={handleConvertConfirm}
				open={convertOpen}
				title="Converter lead"
			/>

			<LeadDealsDialog
				leadId={targetLead?.id ?? null}
				leadStoreId={targetLead?.storeId ?? null}
				onClose={() => {
					setDealsOpen(false);
					setDialogError(null);
				}}
				open={dealsOpen}
			/>
		</div>
	);
}

export { LeadDetailPageContent };
