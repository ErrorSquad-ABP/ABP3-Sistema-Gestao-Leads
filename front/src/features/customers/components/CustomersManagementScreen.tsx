'use client';

import { Plus, Search, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { isApiError } from '@/lib/http/api-error';

import {
	useCreateCustomerMutation,
	useDeleteCustomerMutation,
	useUpdateCustomerMutation,
} from '../hooks/customers.mutations';
import { useCustomersQuery } from '../hooks/customers.queries';
import type { CustomerRecord } from '../model/customers.model';
import {
	CustomerDeleteDialog,
	CustomerFormDialog,
	emptyCustomerForm,
	toCustomerFormState,
	toCustomerPayload,
	type CustomerDialogState,
	type CustomerFormState,
} from './CustomerForm';
import { CustomersTable } from './CustomersTable';

const PAGE_SIZE = 10;

function getCustomersErrorMessage(error: unknown) {
	if (!isApiError(error)) {
		return 'Não foi possível concluir a operação agora.';
	}

	if (error.status === 409) {
		return 'Já existe um cliente com os dados informados.';
	}

	return error.message;
}

function CustomersManagementScreen() {
	const customersQuery = useCustomersQuery();
	const createCustomerMutation = useCreateCustomerMutation();
	const updateCustomerMutation = useUpdateCustomerMutation();
	const deleteCustomerMutation = useDeleteCustomerMutation();

	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [dialogState, setDialogState] = useState<CustomerDialogState | null>(
		null,
	);
	const [deleteTarget, setDeleteTarget] = useState<CustomerRecord | null>(null);
	const [formState, setFormState] =
		useState<CustomerFormState>(emptyCustomerForm);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const customers = useMemo(
		() => customersQuery.data ?? [],
		[customersQuery.data],
	);
	const normalizedSearch = search.trim().toLowerCase();
	const filteredCustomers = useMemo(
		() =>
			customers.filter((customer) => {
				if (!normalizedSearch) {
					return true;
				}

				return [
					customer.name,
					customer.email ?? '',
					customer.phone ?? '',
					customer.cpf ?? '',
				]
					.join(' ')
					.toLowerCase()
					.includes(normalizedSearch);
			}),
		[customers, normalizedSearch],
	);

	const totalPages = Math.max(
		1,
		Math.ceil(filteredCustomers.length / PAGE_SIZE),
	);
	const currentPage = Math.min(page, totalPages);
	const pagedCustomers = filteredCustomers.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE,
	);

	function openCreateDialog() {
		setDialogError(null);
		setFormState(emptyCustomerForm);
		setDialogState({ mode: 'create', customer: null });
	}

	function openEditDialog(customer: CustomerRecord) {
		setDialogError(null);
		setFormState(toCustomerFormState(customer));
		setDialogState({ mode: 'edit', customer });
	}

	async function handleCustomerSubmit() {
		const payload = toCustomerPayload(formState);
		if (!payload) {
			setDialogError('Informe pelo menos o nome do cliente.');
			return;
		}

		setDialogError(null);
		try {
			if (dialogState?.mode === 'edit' && dialogState.customer) {
				await updateCustomerMutation.mutateAsync({
					id: dialogState.customer.id,
					body: payload,
				});
			} else {
				await createCustomerMutation.mutateAsync(payload);
			}

			setDialogState(null);
			setFormState(emptyCustomerForm);
		} catch (error) {
			setDialogError(getCustomersErrorMessage(error));
		}
	}

	async function handleDeleteConfirm() {
		if (!deleteTarget) {
			return;
		}

		setDeleteError(null);
		try {
			await deleteCustomerMutation.mutateAsync(deleteTarget.id);
			setDeleteTarget(null);
		} catch (error) {
			setDeleteError(getCustomersErrorMessage(error));
		}
	}

	return (
		<div className="space-y-6">
			<Card className="overflow-hidden rounded-[1.75rem] border-border/90 bg-white">
				<CardHeader className="gap-5 border-none pb-6">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-3">
							<div className="flex size-12 items-center justify-center rounded-2xl border border-[#d96c3f]/16 bg-[#d96c3f]/10 text-[#d96c3f]">
								<UserRound className="size-5" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
									Workspace
								</p>
								<CardTitle className="text-[1.9rem] font-semibold tracking-tight">
									Clientes
								</CardTitle>
								<p className="max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
									Mantenha o cadastro comercial com nomes, contato e documento
									sem expor identificadores técnicos na operação.
								</p>
							</div>
						</div>
						<CardAction className="static self-start">
							<Button
								className="rounded-md bg-[#2D3648] shadow-none hover:bg-[#232B3B]"
								onClick={openCreateDialog}
							>
								<Plus className="size-4" />
								Novo cliente
							</Button>
						</CardAction>
					</div>
				</CardHeader>
				<CardContent className="space-y-5 pt-0">
					<div className="relative w-full lg:max-w-md">
						<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6b7687]" />
						<Input
							className="h-10 rounded-md border-[#d6dce5] bg-[#f8fafc] pl-9 shadow-none focus-visible:border-[#2d3648]/45"
							onChange={(event) => {
								setSearch(event.target.value);
								setPage(1);
							}}
							placeholder="Pesquisar por nome, e-mail, telefone ou CPF"
							value={search}
						/>
					</div>

					{customersQuery.isLoading ? (
						<div className="rounded-2xl border border-border/80 bg-muted/20 px-4 py-8 text-sm text-muted-foreground">
							Carregando clientes...
						</div>
					) : customersQuery.isError ? (
						<div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
							{getCustomersErrorMessage(customersQuery.error)}
						</div>
					) : (
						<CustomersTable
							currentPage={currentPage}
							customers={pagedCustomers}
							onDelete={(customer) => {
								setDeleteError(null);
								setDeleteTarget(customer);
							}}
							onEdit={openEditDialog}
							onNextPage={() => setPage((value) => value + 1)}
							onPreviousPage={() => setPage((value) => value - 1)}
							totalItems={filteredCustomers.length}
							totalPages={totalPages}
						/>
					)}
				</CardContent>
			</Card>

			<CustomerFormDialog
				createPending={createCustomerMutation.isPending}
				dialogError={dialogError}
				dialogState={dialogState}
				formState={formState}
				onClose={() => {
					setDialogState(null);
					setDialogError(null);
				}}
				onSave={() => {
					void handleCustomerSubmit();
				}}
				onStateChange={(updater) => setFormState(updater)}
				updatePending={updateCustomerMutation.isPending}
			/>

			<CustomerDeleteDialog
				deleteError={deleteError}
				deletePending={deleteCustomerMutation.isPending}
				deleteTarget={deleteTarget}
				onClose={() => {
					setDeleteTarget(null);
					setDeleteError(null);
				}}
				onConfirm={() => {
					void handleDeleteConfirm();
				}}
			/>
		</div>
	);
}

export { CustomersManagementScreen };
