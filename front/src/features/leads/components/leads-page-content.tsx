'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCheck, LayoutList, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { ApiError, isApiError } from '@/lib/http/api-error';

import {
	useLeadCustomersQuery,
	useLeadOwnersQuery,
	useLeadStoresQuery,
} from '../hooks/leads.catalog.queries';
import { useLeadsListQuery } from '../hooks/leads.queries';
import {
	useConvertLeadMutation,
	useCreateLeadMutation,
	useDeleteLeadMutation,
	useReassignLeadMutation,
	useUpdateLeadMutation,
} from '../hooks/leads.mutations';
import {
	formatLeadSourceLabel,
	formatLeadStatusLabel,
	formatShortId,
	leadSourceOptions,
	leadStatusOptions,
} from '../lib/lead-list-labels';
import {
	leadFormSchema,
	reassignLeadSchema,
} from '../schemas/lead-management.schema';
import type {
	CreateLeadInput,
	LeadCustomer,
	LeadFormValues,
	LeadListItem,
	LeadOwnerRecord,
	LeadSource,
	LeadStatus,
	LeadStore,
	ReassignLeadFormValues,
	ReassignLeadInput,
	UpdateLeadInput,
} from '../types/leads.types';
import { LeadsTable } from './LeadsTable';

type LeadsPageContentProps = {
	user: AuthenticatedUser;
};

type LeadFormDialogProps = {
	customers: LeadCustomer[];
	isPending: boolean;
	mode: 'create' | 'edit';
	onClose: () => void;
	onSubmit: (values: CreateLeadInput | UpdateLeadInput) => Promise<void>;
	open: boolean;
	owners: LeadOwnerRecord[];
	stores: LeadStore[];
	targetLead: LeadListItem | null;
	user: AuthenticatedUser;
};

type LeadReassignDialogProps = {
	currentOwnerLabel: string;
	isPending: boolean;
	onClose: () => void;
	onSubmit: (values: ReassignLeadInput) => Promise<void>;
	open: boolean;
	ownerOptions: { value: string; label: string }[];
	targetLead: LeadListItem | null;
	user: AuthenticatedUser;
};

type LeadConfirmDialogProps = {
	confirmLabel: string;
	description: string;
	error: string | null;
	icon: 'convert' | 'delete';
	isPending: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	open: boolean;
	title: string;
};

const SKELETON_ROW_KEYS = ['r0', 'r1', 'r2', 'r3', 'r4', 'r5'] as const;

function getLeadsErrorMessage(error: unknown) {
	if (!isApiError(error)) {
		return 'Não foi possível concluir a operação agora. Tente novamente em instantes.';
	}

	if (error.status === 400) {
		return (
			error.message || 'Os dados do lead não passaram na validação da API.'
		);
	}

	if (error.status === 403) {
		return (
			error.message || 'O seu perfil não tem permissão para esta operação.'
		);
	}

	if (error.status === 404) {
		return error.message || 'O lead selecionado não foi encontrado.';
	}

	return error.message;
}

function normalizeSearchValue(value: string) {
	return value.trim().toLowerCase();
}

function buildCustomerLabelById(customers: LeadCustomer[]) {
	const entries = customers.map(
		(customer) => [customer.id, customer.name] as const,
	);
	return Object.fromEntries(entries);
}

function buildOwnerOptions(params: {
	leadOwners: LeadOwnerRecord[];
	selectedStoreId: string;
}) {
	const ownerMap = new Map<string, string>();

	for (const owner of params.leadOwners) {
		if (
			params.selectedStoreId.length > 0 &&
			!owner.storeIds.includes(params.selectedStoreId)
		) {
			continue;
		}
		ownerMap.set(owner.id, `${owner.name} · ${owner.email}`);
	}

	return [...ownerMap.entries()]
		.map(([value, label]) => ({ value, label }))
		.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}

function LeadsTableSkeleton() {
	return (
		<div className="space-y-2 rounded-2xl border border-border/80 bg-card p-4">
			{SKELETON_ROW_KEYS.map((rowKey) => (
				<Skeleton key={rowKey} className="h-9 w-full" />
			))}
		</div>
	);
}

function LeadFormDialog({
	customers,
	isPending,
	mode,
	onClose,
	onSubmit,
	open,
	owners,
	stores,
	targetLead,
	user,
}: LeadFormDialogProps) {
	const isEditMode = mode === 'edit';
	const [submitError, setSubmitError] = useState<string | null>(null);
	const form = useForm<LeadFormValues>({
		resolver: zodResolver(leadFormSchema),
		defaultValues: {
			customerId: '',
			storeId: '',
			ownerUserId: user.role === 'ATTENDANT' ? user.id : '',
			source: 'whatsapp',
			status: 'NEW',
		},
	});

	useEffect(() => {
		if (!open) {
			form.reset();
			setSubmitError(null);
			return;
		}

		if (isEditMode && targetLead) {
			form.reset({
				customerId: targetLead.customerId,
				storeId: targetLead.storeId,
				ownerUserId:
					user.role === 'ATTENDANT' ? user.id : (targetLead.ownerUserId ?? ''),
				source: targetLead.source as LeadSource,
				status: targetLead.status as LeadStatus,
			});
			return;
		}

		form.reset({
			customerId: customers[0]?.id ?? '',
			storeId: stores[0]?.id ?? '',
			ownerUserId: user.role === 'ATTENDANT' ? user.id : '',
			source: 'whatsapp',
			status: 'NEW',
		});
	}, [
		customers,
		form,
		isEditMode,
		open,
		stores,
		targetLead,
		user.id,
		user.role,
	]);

	const selectedStoreId = form.watch('storeId');
	const ownerOptions = useMemo(
		() =>
			buildOwnerOptions({
				leadOwners: owners,
				selectedStoreId,
			}),
		[owners, selectedStoreId],
	);
	const allowOwnerSelect = user.role !== 'ATTENDANT' && ownerOptions.length > 0;
	const customerOptions = customers.map((customer) => ({
		value: customer.id,
		label: customer.name,
	}));

	async function handleSubmit(values: LeadFormValues) {
		setSubmitError(null);
		try {
			if (isEditMode) {
				await onSubmit({
					customerId: values.customerId,
					storeId: values.storeId,
					ownerUserId: values.ownerUserId || null,
					source: values.source,
					status: values.status,
				});
			} else {
				await onSubmit({
					customerId: values.customerId,
					storeId: values.storeId,
					ownerUserId: values.ownerUserId || null,
					source: values.source,
				});
			}
			onClose();
		} catch (error) {
			setSubmitError(getLeadsErrorMessage(error));
		}
	}

	return (
		<Dialog
			onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}
			open={open}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? 'Atualizar lead' : 'Novo lead'}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? 'Ajuste origem, estado, cliente, loja e responsável do lead.'
							: 'Registe um novo lead operacional com origem, cliente e loja.'}
					</DialogDescription>
				</DialogHeader>

				<form
					className="space-y-5 px-6 py-5"
					onSubmit={form.handleSubmit((values) => handleSubmit(values))}
				>
					{submitError ? (
						<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							{submitError}
						</div>
					) : null}

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1.5 md:col-span-2">
							<Label htmlFor="lead-form-customer">Cliente</Label>
							<select
								className="flex h-10 w-full rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
								id="lead-form-customer"
								onChange={(event) =>
									form.setValue('customerId', event.target.value, {
										shouldDirty: true,
										shouldValidate: true,
									})
								}
								value={form.watch('customerId')}
							>
								<option value="" disabled>
									Selecione um cliente
								</option>
								{customerOptions.map((customer) => (
									<option key={customer.value} value={customer.value}>
										{customer.label}
									</option>
								))}
							</select>
							{form.formState.errors.customerId ? (
								<p className="text-xs text-destructive">
									{form.formState.errors.customerId.message}
								</p>
							) : null}
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="lead-form-store">Loja</Label>
							<select
								className="flex h-10 w-full rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
								id="lead-form-store"
								onChange={(event) =>
									form.setValue('storeId', event.target.value, {
										shouldDirty: true,
										shouldValidate: true,
									})
								}
								value={form.watch('storeId')}
							>
								<option value="" disabled>
									Selecione uma loja
								</option>
								{stores.map((store) => (
									<option key={store.id} value={store.id}>
										{store.name}
									</option>
								))}
							</select>
							{form.formState.errors.storeId ? (
								<p className="text-xs text-destructive">
									{form.formState.errors.storeId.message}
								</p>
							) : null}
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="lead-form-source">Origem</Label>
							<select
								className="flex h-10 w-full rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
								id="lead-form-source"
								onChange={(event) =>
									form.setValue('source', event.target.value as LeadSource, {
										shouldDirty: true,
										shouldValidate: true,
									})
								}
								value={form.watch('source')}
							>
								{leadSourceOptions.map((source) => (
									<option key={source.value} value={source.value}>
										{source.label}
									</option>
								))}
							</select>
							{form.formState.errors.source ? (
								<p className="text-xs text-destructive">
									{form.formState.errors.source.message}
								</p>
							) : null}
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="lead-form-owner">Responsável</Label>
							{user.role === 'ATTENDANT' ? (
								<div className="flex h-10 items-center rounded-md border border-[#d6dce5] bg-[#f8fafc] px-3 text-sm text-[#6b7687]">
									{user.name} (você)
								</div>
							) : allowOwnerSelect ? (
								<select
									className="flex h-10 w-full rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
									id="lead-form-owner"
									onChange={(event) =>
										form.setValue('ownerUserId', event.target.value, {
											shouldDirty: true,
											shouldValidate: true,
										})
									}
									value={form.watch('ownerUserId')}
								>
									<option value="">Sem responsável</option>
									{ownerOptions.map((owner) => (
										<option key={owner.value} value={owner.value}>
											{owner.label}
										</option>
									))}
								</select>
							) : (
								<div className="flex h-10 items-center rounded-md border border-[#d6dce5] bg-[#f8fafc] px-3 text-sm text-[#6b7687]">
									Selecione uma loja com responsáveis disponíveis.
								</div>
							)}
							{user.role !== 'ATTENDANT' && !allowOwnerSelect ? (
								<p className="text-xs text-[#6b7687]">
									Não há responsáveis elegíveis para a loja selecionada dentro
									do seu escopo atual.
								</p>
							) : null}
							{form.formState.errors.ownerUserId ? (
								<p className="text-xs text-destructive">
									{form.formState.errors.ownerUserId.message}
								</p>
							) : null}
						</div>

						{isEditMode ? (
							<div className="space-y-1.5">
								<Label htmlFor="lead-form-status">Estado</Label>
								<select
									className="flex h-10 w-full rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
									id="lead-form-status"
									onChange={(event) =>
										form.setValue('status', event.target.value as LeadStatus, {
											shouldDirty: true,
											shouldValidate: true,
										})
									}
									value={form.watch('status')}
								>
									{leadStatusOptions.map((status) => (
										<option key={status.value} value={status.value}>
											{status.label}
										</option>
									))}
								</select>
								{form.formState.errors.status ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.status.message}
									</p>
								) : null}
							</div>
						) : null}
					</div>

					<DialogFooter className="px-0 pb-0 pt-4">
						<Button
							className="rounded-md"
							onClick={onClose}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button
							className="rounded-md bg-[#2D3648] hover:bg-[#232B3B]"
							disabled={isPending}
							type="submit"
						>
							{isPending
								? isEditMode
									? 'Salvando...'
									: 'Criando...'
								: isEditMode
									? 'Salvar alterações'
									: 'Criar lead'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function LeadReassignDialog({
	currentOwnerLabel,
	isPending,
	onClose,
	onSubmit,
	open,
	ownerOptions,
	targetLead,
	user,
}: LeadReassignDialogProps) {
	const [submitError, setSubmitError] = useState<string | null>(null);
	const form = useForm<ReassignLeadFormValues>({
		resolver: zodResolver(reassignLeadSchema),
		defaultValues: {
			ownerUserId: '',
		},
	});

	useEffect(() => {
		if (!open) {
			form.reset({ ownerUserId: '' });
			setSubmitError(null);
			return;
		}

		form.reset({
			ownerUserId: targetLead?.ownerUserId ?? '',
		});
	}, [form, open, targetLead]);

	async function handleSubmit(values: ReassignLeadFormValues) {
		setSubmitError(null);
		try {
			await onSubmit({ ownerUserId: values.ownerUserId || null });
			onClose();
		} catch (error) {
			setSubmitError(getLeadsErrorMessage(error));
		}
	}

	const allowOwnerSelect = ownerOptions.length > 0;

	return (
		<Dialog
			onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}
			open={open}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Reatribuir lead</DialogTitle>
					<DialogDescription>
						Defina o novo responsável operacional pelo lead.
					</DialogDescription>
				</DialogHeader>

				<form
					className="space-y-5 px-6 py-5"
					onSubmit={form.handleSubmit(handleSubmit)}
				>
					<div className="rounded-xl border border-border/75 bg-[#f8fafc] px-3 py-3 text-sm text-[#6b7687]">
						Responsável atual:{' '}
						<span className="font-medium text-[#1b2430]">
							{currentOwnerLabel}
						</span>
					</div>

					{submitError ? (
						<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							{submitError}
						</div>
					) : null}

					<div className="space-y-1.5">
						<Label htmlFor="lead-reassign-owner">Novo responsável</Label>
						{allowOwnerSelect ? (
							<select
								className="flex h-10 w-full rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
								id="lead-reassign-owner"
								onChange={(event) =>
									form.setValue('ownerUserId', event.target.value, {
										shouldDirty: true,
										shouldValidate: true,
									})
								}
								value={form.watch('ownerUserId')}
							>
								<option value="">Sem responsável</option>
								{ownerOptions.map((owner) => (
									<option key={owner.value} value={owner.value}>
										{owner.label}
									</option>
								))}
							</select>
						) : (
							<div className="flex h-10 items-center rounded-md border border-[#d6dce5] bg-[#f8fafc] px-3 text-sm text-[#6b7687]">
								{user.role === 'ATTENDANT'
									? 'Reatribuição indisponível para este papel'
									: 'Nenhum responsável elegível dentro do seu escopo.'}
							</div>
						)}
						{!allowOwnerSelect ? (
							<p className="text-xs text-[#6b7687]">
								O catálogo de responsáveis agora é controlado pelo backend
								conforme o escopo real de RBAC.
							</p>
						) : null}
						{form.formState.errors.ownerUserId ? (
							<p className="text-xs text-destructive">
								{form.formState.errors.ownerUserId.message}
							</p>
						) : null}
					</div>

					<DialogFooter className="px-0 pb-0 pt-4">
						<Button
							className="rounded-md"
							onClick={onClose}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button
							className="rounded-md bg-[#2D3648] hover:bg-[#232B3B]"
							disabled={isPending}
							type="submit"
						>
							{isPending ? 'Aplicando...' : 'Aplicar reatribuição'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function LeadConfirmDialog({
	confirmLabel,
	description,
	error,
	icon,
	isPending,
	onClose,
	onConfirm,
	open,
	title,
}: LeadConfirmDialogProps) {
	return (
		<Dialog
			onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}
			open={open}
		>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 px-6 py-5">
					<div className="flex items-start gap-3 rounded-xl border border-border/75 bg-[#f8fafc] px-4 py-4 text-sm text-[#6b7687]">
						{icon === 'convert' ? (
							<CheckCheck className="mt-0.5 size-4 text-[#d96c3f]" />
						) : (
							<Trash2 className="mt-0.5 size-4 text-destructive" />
						)}
						<p>{description}</p>
					</div>
					{error ? (
						<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							{error}
						</div>
					) : null}
				</div>
				<DialogFooter>
					<Button
						className="rounded-md"
						onClick={onClose}
						type="button"
						variant="outline"
					>
						Cancelar
					</Button>
					<Button
						className="rounded-md bg-[#2D3648] hover:bg-[#232B3B]"
						disabled={isPending}
						onClick={() => {
							void onConfirm();
						}}
						type="button"
					>
						{isPending ? 'Processando...' : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function LeadsPageContent({ user }: LeadsPageContentProps) {
	const query = useLeadsListQuery(user);
	const customersQuery = useLeadCustomersQuery();
	const storesQuery = useLeadStoresQuery();
	const ownersQuery = useLeadOwnersQuery();
	const createLeadMutation = useCreateLeadMutation();
	const updateLeadMutation = useUpdateLeadMutation();
	const reassignLeadMutation = useReassignLeadMutation();
	const convertLeadMutation = useConvertLeadMutation();
	const deleteLeadMutation = useDeleteLeadMutation();
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<
		'ALL' | LeadListItem['status']
	>('ALL');
	const [sourceFilter, setSourceFilter] = useState<
		'ALL' | LeadListItem['source']
	>('ALL');
	const [leadFormMode, setLeadFormMode] = useState<'create' | 'edit'>('create');
	const [leadFormOpen, setLeadFormOpen] = useState(false);
	const [reassignOpen, setReassignOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [convertOpen, setConvertOpen] = useState(false);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [targetLead, setTargetLead] = useState<LeadListItem | null>(null);
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

	const title = user.role === 'ATTENDANT' ? 'Meus leads' : 'Gestão de leads';
	let subtitle =
		'Centralize entrada, reatribuição e evolução dos leads do seu escopo.';
	if (user.role === 'ATTENDANT') {
		subtitle =
			'Acompanhe os leads sob sua responsabilidade e atualize o fluxo comercial.';
	} else if (scope?.kind === 'all') {
		subtitle =
			user.role === 'GENERAL_MANAGER'
				? 'Vista global de leads para acompanhamento executivo do pipeline.'
				: 'Visão administrativa completa para governança operacional dos leads.';
	}

	const customers = customersQuery.data ?? [];
	const stores = storesQuery.data ?? [];
	const owners = ownersQuery.data ?? [];
	const customerLabelById = useMemo(
		() => buildCustomerLabelById(customers),
		[customers],
	);
	const storeLabelById = useMemo(
		() => Object.fromEntries(stores.map((store) => [store.id, store.name])),
		[stores],
	);
	const ownerLabelById = useMemo(
		() =>
			Object.fromEntries(
				owners.map((owner) => [owner.id, `${owner.name} · ${owner.email}`]),
			),
		[owners],
	);
	const normalizedSearch = normalizeSearchValue(search);
	const filteredLeads = useMemo(
		() =>
			leads.filter((lead) => {
				if (statusFilter !== 'ALL' && lead.status !== statusFilter) {
					return false;
				}
				if (sourceFilter !== 'ALL' && lead.source !== sourceFilter) {
					return false;
				}
				if (!normalizedSearch) {
					return true;
				}

				const haystack = [
					lead.id,
					customerLabelById[lead.customerId] ?? lead.customerId,
					storeLabelById[lead.storeId] ?? lead.storeId,
					lead.ownerUserId
						? (ownerLabelById[lead.ownerUserId] ?? lead.ownerUserId)
						: 'sem responsável',
					formatLeadSourceLabel(lead.source),
					formatLeadStatusLabel(lead.status),
				]
					.join(' ')
					.toLowerCase();

				return haystack.includes(normalizedSearch);
			}),
		[
			customerLabelById,
			leads,
			normalizedSearch,
			ownerLabelById,
			sourceFilter,
			statusFilter,
			storeLabelById,
		],
	);

	function openCreateDialog() {
		setDialogError(null);
		setTargetLead(null);
		setLeadFormMode('create');
		setLeadFormOpen(true);
	}

	function openEditDialog(lead: LeadListItem) {
		setDialogError(null);
		setTargetLead(lead);
		setLeadFormMode('edit');
		setLeadFormOpen(true);
	}

	function openReassignDialog(lead: LeadListItem) {
		setDialogError(null);
		setTargetLead(lead);
		setReassignOpen(true);
	}

	function openDeleteDialog(lead: LeadListItem) {
		setDialogError(null);
		setTargetLead(lead);
		setDeleteOpen(true);
	}

	function openConvertDialog(lead: LeadListItem) {
		setDialogError(null);
		setTargetLead(lead);
		setConvertOpen(true);
	}

	async function handleLeadFormSubmit(
		values: CreateLeadInput | UpdateLeadInput,
	) {
		if (leadFormMode === 'create') {
			await createLeadMutation.mutateAsync(values as CreateLeadInput);
			return;
		}
		if (!targetLead) {
			return;
		}
		await updateLeadMutation.mutateAsync({
			leadId: targetLead.id,
			payload: values as UpdateLeadInput,
		});
	}

	async function handleReassignSubmit(values: ReassignLeadInput) {
		if (!targetLead) {
			return;
		}
		await reassignLeadMutation.mutateAsync({
			leadId: targetLead.id,
			payload: values,
		});
	}

	async function handleDeleteConfirm() {
		if (!targetLead) {
			return;
		}
		setDialogError(null);
		try {
			await deleteLeadMutation.mutateAsync(targetLead.id);
			setDeleteOpen(false);
			setTargetLead(null);
		} catch (nextError) {
			setDialogError(getLeadsErrorMessage(nextError));
		}
	}

	async function handleConvertConfirm() {
		if (!targetLead) {
			return;
		}
		setDialogError(null);
		try {
			await convertLeadMutation.mutateAsync(targetLead.id);
			setConvertOpen(false);
			setTargetLead(null);
		} catch (nextError) {
			setDialogError(getLeadsErrorMessage(nextError));
		}
	}

	const currentOwnerLabel = targetLead?.ownerUserId
		? (ownerLabelById[targetLead.ownerUserId] ??
			`Usuário ${formatShortId(targetLead.ownerUserId)}`)
		: 'Sem responsável';

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
					Sem equipas com visibilidade para listagem ou criação de leads.
					Contacte um administrador se precisar de apoio.
				</div>
			) : null}

			{scope !== null && scope.kind !== 'none' ? (
				<>
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
					{isPending ? <LeadsTableSkeleton /> : null}
					{isSuccess ? (
						<Card className="overflow-hidden rounded-[1.75rem] border-border/90 bg-white">
							<CardHeader className="gap-5 border-none pb-6">
								<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
									<div className="space-y-2">
										<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
											Operação comercial
										</p>
										<CardTitle className="text-[1.45rem] font-semibold tracking-tight">
											Lista operacional de leads
										</CardTitle>
										<p className="max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
											Crie, atualize, reatribua e converta leads dentro do seu
											escopo de atuação.
										</p>
									</div>
									<CardAction className="static self-start">
										<Button
											className="rounded-md bg-[#2D3648] hover:bg-[#232B3B]"
											onClick={openCreateDialog}
											type="button"
										>
											<Plus className="size-4" />
											Novo lead
										</Button>
									</CardAction>
								</div>
							</CardHeader>
							<CardContent className="space-y-5 pt-0">
								<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
									<div className="relative w-full lg:max-w-md">
										<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6b7687]" />
										<Input
											className="h-10 rounded-md border-[#d6dce5] bg-[#f8fafc] pl-9 shadow-none focus-visible:border-[#2d3648]/45"
											onChange={(event) => setSearch(event.target.value)}
											placeholder="Pesquisar por lead, cliente, loja ou responsável"
											value={search}
										/>
									</div>
									<div className="flex flex-col gap-3 sm:flex-row">
										<select
											className="h-10 rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
											onChange={(event) =>
												setStatusFilter(
													event.target.value as 'ALL' | LeadListItem['status'],
												)
											}
											value={statusFilter}
										>
											<option value="ALL">Todos os estados</option>
											{leadStatusOptions.map((status) => (
												<option key={status.value} value={status.value}>
													{status.label}
												</option>
											))}
										</select>
										<select
											className="h-10 rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
											onChange={(event) =>
												setSourceFilter(
													event.target.value as 'ALL' | LeadListItem['source'],
												)
											}
											value={sourceFilter}
										>
											<option value="ALL">Todas as origens</option>
											{leadSourceOptions.map((source) => (
												<option key={source.value} value={source.value}>
													{source.label}
												</option>
											))}
										</select>
									</div>
								</div>

								<LeadsTable
									customerLabelById={customerLabelById}
									leads={filteredLeads}
									onConvert={openConvertDialog}
									onDelete={
										user.role === 'ADMINISTRATOR' ? openDeleteDialog : undefined
									}
									onEdit={openEditDialog}
									onReassign={
										user.role === 'ATTENDANT' ? undefined : openReassignDialog
									}
									ownerLabelById={ownerLabelById}
									storeLabelById={storeLabelById}
								/>
							</CardContent>
						</Card>
					) : null}
				</>
			) : null}

			<LeadFormDialog
				customers={customers}
				isPending={
					leadFormMode === 'create'
						? createLeadMutation.isPending
						: updateLeadMutation.isPending
				}
				mode={leadFormMode}
				onClose={() => {
					setLeadFormOpen(false);
					setTargetLead(null);
				}}
				onSubmit={handleLeadFormSubmit}
				open={leadFormOpen}
				owners={owners}
				stores={stores}
				targetLead={targetLead}
				user={user}
			/>

			<LeadReassignDialog
				currentOwnerLabel={currentOwnerLabel}
				isPending={reassignLeadMutation.isPending}
				onClose={() => {
					setReassignOpen(false);
					setTargetLead(null);
				}}
				onSubmit={handleReassignSubmit}
				open={reassignOpen}
				ownerOptions={
					targetLead
						? buildOwnerOptions({
								leadOwners: owners,
								selectedStoreId: targetLead.storeId,
							})
						: []
				}
				targetLead={targetLead}
				user={user}
			/>

			<LeadConfirmDialog
				confirmLabel="Confirmar conversão"
				description={
					targetLead
						? `O lead ${formatShortId(targetLead.id)} será marcado como convertido.`
						: 'Confirme a conversão do lead selecionado.'
				}
				error={dialogError}
				icon="convert"
				isPending={convertLeadMutation.isPending}
				onClose={() => {
					setConvertOpen(false);
					setTargetLead(null);
					setDialogError(null);
				}}
				onConfirm={handleConvertConfirm}
				open={convertOpen}
				title="Converter lead"
			/>

			<LeadConfirmDialog
				confirmLabel="Excluir lead"
				description={
					targetLead
						? `O lead ${formatShortId(targetLead.id)} será removido permanentemente.`
						: 'Confirme a exclusão do lead selecionado.'
				}
				error={dialogError}
				icon="delete"
				isPending={deleteLeadMutation.isPending}
				onClose={() => {
					setDeleteOpen(false);
					setTargetLead(null);
					setDialogError(null);
				}}
				onConfirm={handleDeleteConfirm}
				open={deleteOpen}
				title="Excluir lead"
			/>
		</div>
	);
}

export { LeadsPageContent };
