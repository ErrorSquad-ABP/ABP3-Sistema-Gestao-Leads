'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCheck, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ZodError } from 'zod';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { isApiError } from '@/lib/http/api-error';

import { leadSourceOptions, leadStatusOptions } from '../lib/lead-list-labels';
import {
	leadFormSchema,
	reassignLeadSchema,
} from '../schemas/lead-management.schema';
import type {
	CreateLeadInput,
	LeadFormValues,
	LeadListItem,
	LeadOwnerRecord,
	LeadSource,
	LeadStatus,
	LeadStore,
	ReassignLeadFormValues,
	ReassignLeadInput,
	UpdateLeadInput,
} from '../model/leads.model';

type LeadFormDialogProps = {
	customers: { id: string; name: string }[];
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

const leadFormSelectClass =
	'flex h-11 w-full rounded-xl border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45';

function getLeadsErrorMessage(error: unknown) {
	if (error instanceof ZodError) {
		return error.issues[0]?.message ?? 'Dados inválidos. Revise o formulário.';
	}
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
	const selectedCustomerId = useWatch({
		control: form.control,
		name: 'customerId',
	});
	const selectedStoreId = useWatch({
		control: form.control,
		name: 'storeId',
	});
	const sourceValue = useWatch({
		control: form.control,
		name: 'source',
	});
	const ownerUserIdValue = useWatch({
		control: form.control,
		name: 'ownerUserId',
	});
	const statusValue = useWatch({
		control: form.control,
		name: 'status',
	});

	useEffect(() => {
		if (!open) {
			form.reset();
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

	useEffect(() => {
		if (!open || isEditMode) {
			return;
		}

		const customerIds = new Set(customers.map((customer) => customer.id));
		const storeIds = new Set(stores.map((store) => store.id));
		const currentCustomerId = form.getValues('customerId');
		if (!currentCustomerId || !customerIds.has(currentCustomerId)) {
			const nextCustomerId = customers[0]?.id ?? '';
			if (nextCustomerId) {
				form.setValue('customerId', nextCustomerId, { shouldValidate: true });
			}
		}

		const currentStoreId = form.getValues('storeId');
		if (!currentStoreId || !storeIds.has(currentStoreId)) {
			const nextStoreId = stores[0]?.id ?? '';
			if (nextStoreId) {
				form.setValue('storeId', nextStoreId, { shouldValidate: true });
			}
		}
	}, [open, isEditMode, customers, stores, form]);

	const ownerOptions = useMemo(
		() =>
			buildOwnerOptions({
				leadOwners: owners,
				selectedStoreId,
			}),
		[owners, selectedStoreId],
	);
	const allowOwnerSelect = user.role !== 'ATTENDANT' && ownerOptions.length > 0;

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
			onOpenChange={(nextOpen) => {
				if (nextOpen) {
					return;
				}
				setSubmitError(null);
				onClose();
			}}
			open={open}
		>
			<DialogContent className="flex min-h-136 max-h-[84vh] max-w-4xl flex-col overflow-hidden rounded-[1.75rem] border border-[#d8e0ea] bg-white md:min-h-152">
				<DialogHeader className="gap-3 border-b border-[#e5ebf3] px-8 py-7">
					<div className="flex items-center gap-4">
						<div className="flex size-13 items-center justify-center rounded-2xl border border-[#d96c3f]/15 bg-[#d96c3f]/10 text-[#d96c3f]">
							<Plus className="size-6" />
						</div>
						<div className="space-y-1">
							<p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#d96c3f]">
								Leads
							</p>
							<DialogTitle>
								{isEditMode ? 'Editar lead operacional' : 'Novo lead'}
							</DialogTitle>
							<DialogDescription className="max-w-2xl">
								{isEditMode
									? 'Atualize cliente, loja, origem, responsável e estado sem perder a consistência operacional do funil.'
									: 'Registre um novo lead com cliente, loja, origem e responsável dentro do seu escopo.'}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<form
					className="flex min-h-0 flex-1 flex-col overflow-hidden"
					onSubmit={form.handleSubmit((values) => handleSubmit(values))}
				>
					<div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-8 pb-8 pt-7">
						{submitError ? (
							<div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
								{submitError}
							</div>
						) : null}

						<div className="rounded-3xl border border-[#e5ebf3] bg-[#f9fbfd] p-5">
							<div className="space-y-1">
								<Label
									className="text-base font-semibold text-[#1b2430]"
									htmlFor="lead-form-customer"
								>
									Cliente
								</Label>
								<p className="text-sm leading-6 text-[#6b7687]">
									Selecione o cliente já cadastrado para associá-lo ao lead.
								</p>
							</div>
							<div className="mt-4 space-y-2">
								<select
									className={leadFormSelectClass}
									id="lead-form-customer"
									onChange={(event) =>
										form.setValue('customerId', event.target.value, {
											shouldDirty: true,
											shouldValidate: true,
										})
									}
									value={selectedCustomerId}
								>
									<option value="" disabled>
										Selecione um cliente
									</option>
									{customers.map((customer) => (
										<option key={customer.id} value={customer.id}>
											{customer.name}
										</option>
									))}
								</select>
								{form.formState.errors.customerId ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.customerId.message}
									</p>
								) : null}
							</div>
						</div>

						<div className="rounded-3xl border border-[#e5ebf3] bg-white p-5">
							<div className="mb-5 space-y-1">
								<h3 className="text-base font-semibold text-[#1b2430]">
									Dados operacionais
								</h3>
								<p className="text-sm leading-6 text-[#6b7687]">
									Defina a loja, a origem, o responsável e, quando aplicável, o
									estado atual do lead.
								</p>
							</div>

							<div className="grid gap-5 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="lead-form-store">Loja</Label>
									<p className="text-xs leading-5 text-[#6b7687]">
										A loja define o escopo comercial e a lista de responsáveis
										elegíveis.
									</p>
									<select
										className={leadFormSelectClass}
										id="lead-form-store"
										onChange={(event) =>
											form.setValue('storeId', event.target.value, {
												shouldDirty: true,
												shouldValidate: true,
											})
										}
										value={selectedStoreId}
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
										className={leadFormSelectClass}
										id="lead-form-source"
										onChange={(event) =>
											form.setValue(
												'source',
												event.target.value as LeadSource,
												{
													shouldDirty: true,
													shouldValidate: true,
												},
											)
										}
										value={sourceValue}
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
										<div className="flex h-11 items-center rounded-xl border border-[#d6dce5] bg-[#f8fafc] px-3 text-sm text-[#6b7687]">
											{user.name} (você)
										</div>
									) : allowOwnerSelect ? (
										<select
											className={leadFormSelectClass}
											id="lead-form-owner"
											onChange={(event) =>
												form.setValue('ownerUserId', event.target.value, {
													shouldDirty: true,
													shouldValidate: true,
												})
											}
											value={ownerUserIdValue}
										>
											<option value="">Sem responsável</option>
											{ownerOptions.map((owner) => (
												<option key={owner.value} value={owner.value}>
													{owner.label}
												</option>
											))}
										</select>
									) : (
										<div className="flex h-11 items-center rounded-xl border border-[#d6dce5] bg-[#f8fafc] px-3 text-sm text-[#6b7687]">
											Selecione uma loja com responsáveis disponíveis.
										</div>
									)}
									{user.role !== 'ATTENDANT' && !allowOwnerSelect ? (
										<p className="text-xs text-[#6b7687]">
											Não há responsáveis elegíveis para a loja selecionada
											dentro do seu escopo atual.
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
											className={leadFormSelectClass}
											id="lead-form-status"
											onChange={(event) =>
												form.setValue(
													'status',
													event.target.value as LeadStatus,
													{
														shouldDirty: true,
														shouldValidate: true,
													},
												)
											}
											value={statusValue}
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
						</div>
					</div>

					<DialogFooter className="shrink-0 px-8 pb-6 pt-4">
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
	const ownerUserIdValue = useWatch({
		control: form.control,
		name: 'ownerUserId',
	});

	useEffect(() => {
		if (!open) {
			form.reset({ ownerUserId: '' });
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
			onOpenChange={(nextOpen) => {
				if (nextOpen) {
					return;
				}
				setSubmitError(null);
				onClose();
			}}
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
								value={ownerUserIdValue}
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

export {
	buildOwnerOptions,
	getLeadsErrorMessage,
	LeadConfirmDialog,
	LeadFormDialog,
	LeadReassignDialog,
};
