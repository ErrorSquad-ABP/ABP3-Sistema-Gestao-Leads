'use client';

import { Handshake, Plus, Search, Target, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';

import { TablePagination } from '@/components/data/TablePagination';
import { AppTableFilterDropdown } from '@/components/data/AppTableFilterDropdown';
import {
	AppPageHeader,
	appPageActionClass,
	appPageSearchClass,
} from '@/components/layout/AppPageHeader';
import { KpiCard } from '@/components/metrics/KpiCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLeadStoresQuery } from '@/features/leads/hooks/leads.catalog.queries';
import { showCrudSuccessToast } from '@/lib/feedback/crud-success-toast';
import {
	mapApiFieldErrors,
	resolveFormSubmitError,
} from '@/lib/http/apply-api-form-errors';
import {
	humanizeFormApiError,
	humanizePageApiError,
} from '@/lib/http/humanize-api-error';

import {
	useCreateCustomerMutation,
	useDeleteCustomerMutation,
	useUpdateCustomerMutation,
} from '../hooks/customers.mutations';
import { useCustomerCatalogQuery } from '../hooks/customers.queries';
import type {
	CustomerCatalogItem,
	CustomerCatalogSort,
	CustomerCatalogStatus,
	CustomerRecord,
} from '../model/customers.model';
import {
	CustomerDeleteDialog,
	CustomerDetailsDialog,
	CustomerFormDialog,
	emptyCustomerForm,
	toCustomerFormState,
	toCustomerPayload,
	type CustomerDialogState,
	type CustomerFormState,
} from './CustomerForm';
import { CustomersTable } from './CustomersTable';

const pageSizeOptions = [5, 10, 15, 20, 25, 30] as const;

const statusOptions: {
	readonly value: CustomerCatalogStatus;
	readonly label: string;
}[] = [
	{ value: 'ACTIVE', label: 'Ativos' },
	{ value: 'INACTIVE', label: 'Inativos' },
];

const sortOptions: {
	readonly value: CustomerCatalogSort;
	readonly label: string;
}[] = [
	{ value: 'recent', label: 'Mais recentes' },
	{ value: 'deals_desc', label: 'Mais negociações' },
	{ value: 'value_desc', label: 'Maior valor' },
	{ value: 'name_asc', label: 'Nome A-Z' },
];

function formatCount(value: number) {
	return value.toLocaleString('pt-BR');
}

function CustomersManagementScreen() {
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [selectedStatus, setSelectedStatus] = useState<
		CustomerCatalogStatus | ''
	>('');
	const [selectedStoreId, setSelectedStoreId] = useState('');
	const [sort, setSort] = useState<CustomerCatalogSort>('recent');
	const [pageSize, setPageSize] =
		useState<(typeof pageSizeOptions)[number]>(5);
	const [dialogState, setDialogState] = useState<CustomerDialogState | null>(
		null,
	);
	const [deleteTarget, setDeleteTarget] = useState<CustomerRecord | null>(
		null,
	);
	const [detailsTarget, setDetailsTarget] =
		useState<CustomerCatalogItem | null>(null);
	const [formState, setFormState] =
		useState<CustomerFormState>(emptyCustomerForm);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<
		Partial<Pick<CustomerFormState, 'name' | 'email' | 'phone' | 'cpf'>>
	>({});
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const catalogQuery = useCustomerCatalogQuery({
		search,
		storeId: selectedStoreId || undefined,
		status: selectedStatus || undefined,
		sort,
		page,
		limit: pageSize,
	});
	const storesQuery = useLeadStoresQuery();
	const createCustomerMutation = useCreateCustomerMutation();
	const updateCustomerMutation = useUpdateCustomerMutation();
	const deleteCustomerMutation = useDeleteCustomerMutation();

	const catalog = catalogQuery.data;
	const items = catalog?.items ?? [];
	const stores = storesQuery.data ?? [];

	const metricCards = useMemo(
		() => [
			{
				label: 'Total de clientes',
				value: formatCount(catalog?.summary.total ?? 0),
				helper: 'Em todas as lojas',
				icon: <UsersRound className="size-5" />,
				variant: 'brand' as const,
			},
			{
				label: 'Clientes com negociações',
				value: formatCount(catalog?.summary.withDeals ?? 0),
				helper: 'Com histórico comercial',
				icon: <Target className="size-5" />,
				variant: 'success' as const,
			},
			{
				label: 'Clientes ativos',
				value: formatCount(catalog?.summary.active ?? 0),
				helper: 'Com vínculo ou contato',
				icon: <Handshake className="size-5" />,
				variant: 'neutral' as const,
			},
		],
		[catalog],
	);

	function openCreateDialog() {
		setDialogError(null);
		setFieldErrors({});
		setFormState(emptyCustomerForm);
		setDialogState({ mode: 'create', customer: null });
	}

	function openEditDialog(item: CustomerCatalogItem) {
		setDialogError(null);
		setFieldErrors({});
		setFormState(toCustomerFormState(item.customer));
		setDialogState({ mode: 'edit', customer: item.customer });
	}

	async function handleCustomerSubmit() {
		const payload = toCustomerPayload(formState);
		if (!payload) {
			setDialogError('Informe pelo menos o nome do cliente.');
			return;
		}

		setDialogError(null);
		setFieldErrors({});
		try {
			if (dialogState?.mode === 'edit' && dialogState.customer) {
				await updateCustomerMutation.mutateAsync({
					id: dialogState.customer.id,
					body: payload,
				});
				showCrudSuccessToast('customer', 'updated');
			} else {
				await createCustomerMutation.mutateAsync(payload);
				showCrudSuccessToast('customer', 'created');
			}

			setDialogState(null);
			setFormState(emptyCustomerForm);
		} catch (error) {
			setFieldErrors(mapApiFieldErrors(error));
			setDialogError(resolveFormSubmitError(error));
		}
	}

	async function handleDeleteConfirm() {
		if (!deleteTarget) {
			return;
		}

		setDeleteError(null);
		try {
			await deleteCustomerMutation.mutateAsync(deleteTarget.id);
			showCrudSuccessToast('customer', 'deleted');
			setDeleteTarget(null);
		} catch (error) {
			setDeleteError(humanizeFormApiError(error));
		}
	}

	return (
		<div className="space-y-5">
			<AppPageHeader
				action={
					<Button
						className={appPageActionClass}
						onClick={openCreateDialog}
					>
						<Plus className="size-4" />
						Novo cliente
					</Button>
				}
				controls={
					<div className="relative w-full sm:w-[440px]">
						<Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							className={appPageSearchClass}
							onChange={(event) => {
								setSearch(event.target.value);
								setPage(1);
							}}
							placeholder="Buscar por nome, e-mail, telefone ou CPF"
							value={search}
						/>
					</div>
				}
				description="Gerencie seu cadastro comercial e acompanhe seus relacionamentos."
				title="Clientes"
			/>

			<div className="grid gap-4 md:grid-cols-3">
				{metricCards.map((card) => (
					<KpiCard
						description={card.helper}
						icon={card.icon}
						key={card.label}
						title={card.label}
						value={card.value}
						variant={card.variant}
					/>
				))}
			</div>

			<Card className="overflow-hidden rounded-3xl border-border bg-card">
				<CardContent className="p-0">
					<div className="flex flex-col gap-2 p-4 lg:flex-row lg:items-center lg:justify-end">
						<div className="flex flex-wrap items-center gap-2">
							<AppTableFilterDropdown
								defaultValue=""
								label="Status"
								onValueChange={(value) => {
									setSelectedStatus(
										value as CustomerCatalogStatus | '',
									);
									setPage(1);
								}}
								options={[
									{ value: '', label: 'Todos os status' },
									...statusOptions,
								]}
								value={selectedStatus}
							/>
							<AppTableFilterDropdown
								defaultValue=""
								label="Loja"
								onValueChange={(value) => {
									setSelectedStoreId(value);
									setPage(1);
								}}
								options={[
									{ value: '', label: 'Todas as lojas' },
									...stores.map((store) => ({
										value: store.id,
										label: store.name,
									})),
								]}
								value={selectedStoreId}
							/>
							<AppTableFilterDropdown
								defaultValue="recent"
								kind="sort"
								label="Ordem"
								onValueChange={(value) => {
									setSort(value as CustomerCatalogSort);
									setPage(1);
								}}
								options={sortOptions}
								value={sort}
							/>
						</div>
					</div>

					{catalogQuery.isLoading ? (
						<div className="border-t border-border px-7 py-10 text-sm text-muted-foreground">
							Carregando clientes...
						</div>
					) : catalogQuery.isError ? (
						<div className="border-t border-destructive/20 bg-destructive/5 px-7 py-4 text-sm text-destructive">
							{humanizePageApiError(catalogQuery.error)}
						</div>
					) : (
						<>
							<CustomersTable
								items={items}
								onDelete={(item) => {
									setDeleteError(null);
									setDeleteTarget(item.customer);
								}}
								onEdit={openEditDialog}
								onView={setDetailsTarget}
							/>
							<TablePagination
								itemLabel="clientes"
								onPageChange={setPage}
								onPageSizeChange={(value) => {
									setPageSize(
										value as (typeof pageSizeOptions)[number],
									);
									setPage(1);
								}}
								page={catalog?.page ?? page}
								pageSize={pageSize}
								pageSizeOptions={pageSizeOptions}
								totalItems={catalog?.total ?? 0}
								totalPages={catalog?.totalPages ?? 1}
							/>
						</>
					)}
				</CardContent>
			</Card>

			<CustomerFormDialog
				createPending={createCustomerMutation.isPending}
				dialogError={dialogError}
				dialogState={dialogState}
				fieldErrors={fieldErrors}
				formState={formState}
				onClose={() => {
					setDialogState(null);
					setDialogError(null);
					setFieldErrors({});
				}}
				onSave={() => {
					void handleCustomerSubmit();
				}}
				onStateChange={(updater) => {
					setFieldErrors({});
					setFormState(updater);
				}}
				updatePending={updateCustomerMutation.isPending}
			/>

			<CustomerDetailsDialog
				item={detailsTarget}
				onClose={() => setDetailsTarget(null)}
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
