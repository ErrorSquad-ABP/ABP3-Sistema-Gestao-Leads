'use client';

import {
	Building2,
	Pencil,
	Plus,
	Search,
	Trash2,
	UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { useDeleteStoreMutation } from '@/features/stores/hooks/stores.mutations';

import { useDeleteCustomerMutation } from '../hooks/leads.catalog.mutations';
import { getCatalogCrudErrorMessage } from '../lib/catalog-crud-errors';
import type { LeadCustomer, LeadStore } from '../types/leads.types';
import {
	CatalogDeleteConfirmDialog,
	CustomerCatalogFormDialog,
	StoreCatalogFormDialog,
} from './lead-catalog-crud-dialogs';

type CustomerManagerDialogProps = {
	customers: LeadCustomer[];
	onClose: () => void;
	open: boolean;
};

type StoreManagerDialogProps = {
	onClose: () => void;
	open: boolean;
	stores: LeadStore[];
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

function CustomerManagerDialog({
	customers,
	onClose,
	open,
}: CustomerManagerDialogProps) {
	const [search, setSearch] = useState('');
	const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
		null,
	);
	const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
	const [customerDialogMode, setCustomerDialogMode] = useState<
		'create' | 'edit'
	>('create');
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<LeadCustomer | null>(null);
	const deleteCustomerMutation = useDeleteCustomerMutation();
	const activeCustomerId =
		selectedCustomerId &&
		customers.some((customer) => customer.id === selectedCustomerId)
			? selectedCustomerId
			: (customers[0]?.id ?? null);
	const selectedCustomer =
		customers.find((customer) => customer.id === activeCustomerId) ?? null;
	const filteredCustomers = useMemo(() => {
		const normalized = search.trim().toLowerCase();
		if (!normalized) {
			return customers;
		}
		return customers.filter((customer) =>
			[
				customer.name,
				customer.email ?? '',
				customer.phone ?? '',
				customer.cpf ?? '',
			]
				.join(' ')
				.toLowerCase()
				.includes(normalized),
		);
	}, [customers, search]);

	async function handleDeleteCustomerConfirm() {
		if (!deleteTarget) {
			return;
		}

		setDeleteError(null);
		try {
			await deleteCustomerMutation.mutateAsync(deleteTarget.id);
			setSelectedCustomerId((current) =>
				current === deleteTarget.id ? null : current,
			);
			setDeleteTarget(null);
		} catch (error) {
			setDeleteError(getCatalogCrudErrorMessage(error));
		}
	}

	return (
		<>
			<Dialog
				onOpenChange={(nextOpen) => {
					if (nextOpen) {
						return;
					}
					setSearch('');
					setSelectedCustomerId(null);
					setDeleteTarget(null);
					setDeleteError(null);
					onClose();
				}}
				open={open}
			>
				<DialogContent className="flex min-h-[32rem] max-h-[84vh] max-w-4xl flex-col overflow-hidden rounded-[1.75rem] border border-[#d8e0ea] bg-white md:min-h-[36rem]">
					<DialogHeader className="gap-3 border-b border-[#e5ebf3] px-8 py-7">
						<div className="flex items-center gap-4">
							<div className="flex size-13 items-center justify-center rounded-2xl border border-[#d96c3f]/15 bg-[#d96c3f]/10 text-[#d96c3f]">
								<UserRound className="size-6" />
							</div>
							<div className="space-y-1">
								<p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#d96c3f]">
									Catálogo
								</p>
								<DialogTitle>Gestão de clientes</DialogTitle>
								<DialogDescription className="max-w-2xl">
									Cadastre, ajuste e remova clientes sem misturar essas ações
									com o formulário de lead.
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<div className="flex min-h-0 flex-1 flex-col overflow-hidden px-8 pb-8 pt-7">
						<div className="flex flex-col gap-3 pb-5 lg:flex-row lg:items-center lg:justify-between">
							<div className="relative w-full lg:max-w-md">
								<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6b7687]" />
								<Input
									className="h-11 rounded-xl border-[#d6dce5] bg-[#f8fafc] pl-9 shadow-none focus-visible:border-[#2d3648]/45"
									onChange={(event) => setSearch(event.target.value)}
									placeholder="Pesquisar cliente por nome, e-mail ou CPF"
									value={search}
								/>
							</div>
							<div className="flex flex-wrap gap-2">
								<Button
									className="rounded-full bg-[#2D3648] shadow-none hover:bg-[#232B3B]"
									onClick={() => {
										setCustomerDialogMode('create');
										setCustomerDialogOpen(true);
									}}
									type="button"
								>
									<Plus className="size-4" />
									Novo cliente
								</Button>
								<Button
									className="rounded-full shadow-none"
									disabled={!selectedCustomer}
									onClick={() => {
										setCustomerDialogMode('edit');
										setCustomerDialogOpen(true);
									}}
									type="button"
									variant="outline"
								>
									<Pencil className="size-4" />
									Editar
								</Button>
								<Button
									className="rounded-full shadow-none"
									disabled={!selectedCustomer}
									onClick={() => {
										setDeleteError(null);
										setDeleteTarget(selectedCustomer);
									}}
									type="button"
									variant="destructive"
								>
									<Trash2 className="size-4" />
									Excluir
								</Button>
							</div>
						</div>

						<div className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
							<div className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-[#e5ebf3] bg-[#f9fbfd]">
								<div className="border-b border-[#e5ebf3] px-5 py-4">
									<h3 className="text-sm font-semibold text-[#1b2430]">
										Clientes disponíveis
									</h3>
								</div>
								<div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 pb-5">
									{filteredCustomers.map((customer) => (
										<button
											className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
												selectedCustomerId === customer.id
													? 'border-[#d96c3f]/35 bg-[#d96c3f]/8'
													: 'border-[#e5ebf3] bg-white hover:border-[#d96c3f]/20 hover:bg-[#fdf7f3]'
											}`}
											key={customer.id}
											onClick={() => setSelectedCustomerId(customer.id)}
											type="button"
										>
											<p className="font-medium text-[#1b2430]">
												{customer.name}
											</p>
											<p className="mt-1 text-sm text-[#6b7687]">
												{customer.email ?? 'Sem e-mail'} ·{' '}
												{customer.phone ?? 'Sem telefone'}
											</p>
										</button>
									))}
									{filteredCustomers.length === 0 ? (
										<div className="rounded-2xl border border-dashed border-[#d6dce5] bg-white px-4 py-10 text-center text-sm text-[#6b7687]">
											Nenhum cliente encontrado.
										</div>
									) : null}
								</div>
							</div>

							<div className="min-h-0 overflow-y-auto rounded-3xl border border-[#e5ebf3] bg-white p-5 pb-6">
								<h3 className="text-sm font-semibold text-[#1b2430]">
									Detalhes do cliente
								</h3>
								{selectedCustomer ? (
									<div className="mt-4 space-y-4 text-sm">
										<div>
											<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
												Nome
											</p>
											<p className="mt-1 text-base font-medium text-[#1b2430]">
												{selectedCustomer.name}
											</p>
										</div>
										<div className="grid gap-4 md:grid-cols-2">
											<div>
												<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
													E-mail
												</p>
												<p className="mt-1 text-[#1b2430]">
													{selectedCustomer.email ?? 'Não informado'}
												</p>
											</div>
											<div>
												<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
													Telefone
												</p>
												<p className="mt-1 text-[#1b2430]">
													{selectedCustomer.phone ?? 'Não informado'}
												</p>
											</div>
										</div>
										<div>
											<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
												CPF
											</p>
											<p className="mt-1 text-[#1b2430]">
												{selectedCustomer.cpf ?? 'Não informado'}
											</p>
										</div>
									</div>
								) : (
									<div className="mt-4 rounded-2xl border border-dashed border-[#d6dce5] bg-[#f9fbfd] px-4 py-10 text-center text-sm text-[#6b7687]">
										Selecione um cliente para editar ou excluir.
									</div>
								)}
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			<CustomerCatalogFormDialog
				customer={customerDialogMode === 'edit' ? selectedCustomer : null}
				mode={customerDialogMode}
				onOpenChange={setCustomerDialogOpen}
				onSaved={(customer) => {
					setSelectedCustomerId(customer.id);
				}}
				open={customerDialogOpen}
			/>

			<CatalogDeleteConfirmDialog
				confirmLabel="Confirmar exclusão"
				description={
					deleteTarget
						? `O cliente «${deleteTarget.name}» será removido. Leads associados a este cliente também serão eliminados em cascata.`
						: ''
				}
				error={deleteError}
				isPending={deleteCustomerMutation.isPending}
				onConfirm={handleDeleteCustomerConfirm}
				onOpenChange={(next) => {
					if (!next) {
						setDeleteTarget(null);
						setDeleteError(null);
					}
				}}
				open={deleteTarget !== null}
				title="Excluir cliente"
			/>
		</>
	);
}

function StoreManagerDialog({
	onClose,
	open,
	stores,
	user,
}: StoreManagerDialogProps) {
	const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
	const [storeDialogOpen, setStoreDialogOpen] = useState(false);
	const [storeDialogMode, setStoreDialogMode] = useState<'create' | 'edit'>(
		'create',
	);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<LeadStore | null>(null);
	const deleteStoreMutation = useDeleteStoreMutation();

	const canManageStores =
		user.role === 'ADMINISTRATOR' || user.role === 'GENERAL_MANAGER';
	const activeStoreId =
		selectedStoreId && stores.some((store) => store.id === selectedStoreId)
			? selectedStoreId
			: (stores[0]?.id ?? null);
	const selectedStore =
		stores.find((store) => store.id === activeStoreId) ?? null;

	async function handleDeleteStoreConfirm() {
		if (!deleteTarget) {
			return;
		}

		setDeleteError(null);
		try {
			await deleteStoreMutation.mutateAsync(deleteTarget.id);
			setSelectedStoreId((current) =>
				current === deleteTarget.id ? null : current,
			);
			setDeleteTarget(null);
		} catch (error) {
			setDeleteError(getCatalogCrudErrorMessage(error));
		}
	}

	return (
		<>
			<Dialog
				onOpenChange={(nextOpen) => {
					if (nextOpen) {
						return;
					}
					setSelectedStoreId(null);
					setDeleteTarget(null);
					setDeleteError(null);
					onClose();
				}}
				open={open}
			>
				<DialogContent className="flex min-h-[30rem] max-h-[82vh] max-w-3xl flex-col overflow-hidden rounded-[1.75rem] border border-[#d8e0ea] bg-white md:min-h-[34rem]">
					<DialogHeader className="gap-3 border-b border-[#e5ebf3] px-8 py-7">
						<div className="flex items-center gap-4">
							<div className="flex size-13 items-center justify-center rounded-2xl border border-[#d96c3f]/15 bg-[#d96c3f]/10 text-[#d96c3f]">
								<Building2 className="size-6" />
							</div>
							<div className="space-y-1">
								<p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#d96c3f]">
									Catálogo
								</p>
								<DialogTitle>Gestão de lojas</DialogTitle>
								<DialogDescription className="max-w-2xl">
									Crie, ajuste e remova lojas sem sair do fluxo operacional de
									leads.
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<div className="flex min-h-0 flex-1 flex-col overflow-hidden px-8 pb-8 pt-7">
						<div className="flex flex-wrap gap-2 pb-5">
							<Button
								className="rounded-full bg-[#2D3648] shadow-none hover:bg-[#232B3B]"
								disabled={!canManageStores}
								onClick={() => {
									setStoreDialogMode('create');
									setStoreDialogOpen(true);
								}}
								type="button"
							>
								<Plus className="size-4" />
								Nova loja
							</Button>
							<Button
								className="rounded-full shadow-none"
								disabled={!selectedStore || !canManageStores}
								onClick={() => {
									setStoreDialogMode('edit');
									setStoreDialogOpen(true);
								}}
								type="button"
								variant="outline"
							>
								<Pencil className="size-4" />
								Editar
							</Button>
							<Button
								className="rounded-full shadow-none"
								disabled={!selectedStore || !canManageStores}
								onClick={() => {
									setDeleteError(null);
									setDeleteTarget(selectedStore);
								}}
								type="button"
								variant="destructive"
							>
								<Trash2 className="size-4" />
								Excluir
							</Button>
						</div>

						<div className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
							<div className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-[#e5ebf3] bg-[#f9fbfd]">
								<div className="border-b border-[#e5ebf3] px-5 py-4">
									<h3 className="text-sm font-semibold text-[#1b2430]">
										Lojas disponíveis
									</h3>
								</div>
								<div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 pb-5">
									{stores.map((store) => (
										<button
											className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
												activeStoreId === store.id
													? 'border-[#d96c3f]/35 bg-[#d96c3f]/8'
													: 'border-[#e5ebf3] bg-white hover:border-[#d96c3f]/20 hover:bg-[#fdf7f3]'
											}`}
											key={store.id}
											onClick={() => setSelectedStoreId(store.id)}
											type="button"
										>
											<p className="font-medium text-[#1b2430]">{store.name}</p>
										</button>
									))}
									{stores.length === 0 ? (
										<div className="rounded-2xl border border-dashed border-[#d6dce5] bg-white px-4 py-10 text-center text-sm text-[#6b7687]">
											Nenhuma loja disponível.
										</div>
									) : null}
								</div>
							</div>

							<div className="min-h-0 overflow-y-auto rounded-3xl border border-[#e5ebf3] bg-white p-5 pb-6">
								<h3 className="text-sm font-semibold text-[#1b2430]">
									Detalhes da loja
								</h3>
								{selectedStore ? (
									<div className="mt-4 space-y-4 text-sm">
										<div>
											<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
												Nome
											</p>
											<p className="mt-1 text-base font-medium text-[#1b2430]">
												{selectedStore.name}
											</p>
										</div>
										<p className="rounded-2xl border border-[#e5ebf3] bg-[#f9fbfd] px-4 py-4 leading-6 text-[#6b7687]">
											As lojas organizam a distribuição operacional dos leads e
											controlam os responsáveis elegíveis no fluxo comercial.
										</p>
										{!canManageStores ? (
											<p className="text-xs text-[#6b7687]">
												A gestão de lojas está disponível apenas para
												administrador e gerente geral.
											</p>
										) : null}
									</div>
								) : (
									<div className="mt-4 rounded-2xl border border-dashed border-[#d6dce5] bg-[#f9fbfd] px-4 py-10 text-center text-sm text-[#6b7687]">
										Selecione uma loja para editar ou excluir.
									</div>
								)}
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			<StoreCatalogFormDialog
				mode={storeDialogMode}
				onOpenChange={setStoreDialogOpen}
				onSaved={(store) => {
					setSelectedStoreId(store.id);
				}}
				open={storeDialogOpen}
				store={storeDialogMode === 'edit' ? selectedStore : null}
			/>

			<CatalogDeleteConfirmDialog
				confirmLabel="Confirmar exclusão"
				description={
					deleteTarget
						? `A loja «${deleteTarget.name}» será removida do catálogo operacional.`
						: ''
				}
				error={deleteError}
				isPending={deleteStoreMutation.isPending}
				onConfirm={handleDeleteStoreConfirm}
				onOpenChange={(next) => {
					if (!next) {
						setDeleteTarget(null);
						setDeleteError(null);
					}
				}}
				open={deleteTarget !== null}
				title="Excluir loja"
			/>
		</>
	);
}

export { CustomerManagerDialog, LeadsTableSkeleton, StoreManagerDialog };
