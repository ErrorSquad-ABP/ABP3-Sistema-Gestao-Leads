'use client';

import { Icon } from '@iconify/react';
import {
	Circle,
	Flame,
	Globe2,
	Handshake,
	Megaphone,
	Phone,
	Plus,
	Search,
	Share2,
	Star,
	Store,
	Target,
	UsersRound,
	Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLeadStoresQuery } from '@/features/leads/hooks/leads.catalog.queries';
import {
	mapApiFieldErrors,
	resolveFormSubmitError,
} from '@/lib/http/apply-api-form-errors';
import {
	humanizeFormApiError,
	humanizePageApiError,
} from '@/lib/http/humanize-api-error';
import { appRoutes } from '@/lib/routes/app-routes';

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
import { CustomersTable, formatCurrency } from './CustomersTable';

const pageSizeOptions = [6, 12, 18, 24, 48] as const;

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

function sourceLabel(value: string) {
	switch (value) {
		case 'INDICATION':
			return 'Indicação';
		case 'WEBSITE':
			return 'Site / Formulário';
		case 'WHATSAPP':
			return 'WhatsApp';
		case 'INSTAGRAM':
			return 'Instagram';
		case 'FACEBOOK':
			return 'Facebook';
		case 'MERCADO_LIVRE':
			return 'Mercado Livre';
		case 'PHONE':
			return 'Telefone';
		case 'SOCIAL_MEDIA':
			return 'Redes sociais';
		case 'WALK_IN':
			return 'Loja física';
		case 'Cadastro':
			return 'Cadastro';
		default:
			return value;
	}
}

function SourceIcon({ value }: { readonly value: string }) {
	switch (value) {
		case 'WHATSAPP':
			return (
				<Icon className="size-4 text-[#25d366]" icon="simple-icons:whatsapp" />
			);
		case 'INSTAGRAM':
			return (
				<Icon className="size-4 text-[#e4405f]" icon="simple-icons:instagram" />
			);
		case 'FACEBOOK':
			return (
				<Icon className="size-4 text-[#1877f2]" icon="simple-icons:facebook" />
			);
		case 'MERCADO_LIVRE':
			return (
				<Icon
					className="size-5 text-[#101828]"
					icon="arcticons:mercado-libre"
				/>
			);
		case 'INDICATION':
			return <Megaphone className="size-4 text-[#667085]" />;
		case 'WEBSITE':
			return <Globe2 className="size-4 text-[#667085]" />;
		case 'PHONE':
			return <Phone className="size-4 text-[#667085]" />;
		case 'SOCIAL_MEDIA':
			return <Share2 className="size-4 text-[#667085]" />;
		case 'WALK_IN':
			return <Store className="size-4 text-[#667085]" />;
		case 'Cadastro':
			return <UsersRound className="size-4 text-[#667085]" />;
		default:
			return <Circle className="size-3 text-[#667085]" />;
	}
}

function CustomersManagementScreen() {
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [selectedStatus, setSelectedStatus] = useState<
		CustomerCatalogStatus | ''
	>('');
	const [selectedStoreId, setSelectedStoreId] = useState('');
	const [sort, setSort] = useState<CustomerCatalogSort>('recent');
	const [pageSize, setPageSize] = useState<(typeof pageSizeOptions)[number]>(6);
	const [dialogState, setDialogState] = useState<CustomerDialogState | null>(
		null,
	);
	const [deleteTarget, setDeleteTarget] = useState<CustomerRecord | null>(null);
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
				icon: UsersRound,
				tone: 'orange',
			},
			{
				label: 'Clientes com negociações',
				value: formatCount(catalog?.summary.withDeals ?? 0),
				helper: 'Com histórico comercial',
				icon: Target,
				tone: 'green',
			},
			{
				label: 'Clientes ativos',
				value: formatCount(catalog?.summary.active ?? 0),
				helper: 'Com vínculo ou contato',
				icon: Handshake,
				tone: 'blue',
			},
			{
				label: 'Taxa de retenção',
				value: `${catalog?.summary.retentionRate ?? 0}%`,
				helper: 'Com negociação ganha',
				icon: Star,
				tone: 'purple',
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
			} else {
				await createCustomerMutation.mutateAsync(payload);
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
			setDeleteTarget(null);
		} catch (error) {
			setDeleteError(humanizeFormApiError(error));
		}
	}

	return (
		<div className="space-y-5">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
						Clientes
					</h1>
					<p className="mt-2 text-sm text-[#667085]">
						Gerencie seu cadastro comercial e acompanhe seus relacionamentos.
					</p>
				</div>
				<Button
					className="h-12 rounded-xl bg-[#f05a28] px-5 text-white shadow-none hover:bg-[#df4f1f]"
					onClick={openCreateDialog}
				>
					<Plus className="size-4" />
					Novo cliente
				</Button>
			</div>

			<div className="grid gap-4 xl:grid-cols-4">
				{metricCards.map((card) => {
					const Icon = card.icon;
					return (
						<Card
							className="rounded-3xl border-[#dfe7f1] bg-white"
							key={card.label}
						>
							<CardContent className="flex items-center gap-5 p-6">
								<div
									className={
										card.tone === 'orange'
											? 'flex size-14 items-center justify-center rounded-full bg-orange-50 text-[#f05a28]'
											: card.tone === 'green'
												? 'flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600'
												: card.tone === 'blue'
													? 'flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-600'
													: 'flex size-14 items-center justify-center rounded-full bg-violet-50 text-violet-600'
									}
								>
									<Icon className="size-7" />
								</div>
								<div>
									<p className="text-sm font-medium text-[#667085]">
										{card.label}
									</p>
									<p className="mt-1 text-2xl font-bold text-[#101828]">
										{card.value}
									</p>
									<p className="mt-1 text-xs text-[#667085]">{card.helper}</p>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<Card className="overflow-hidden rounded-3xl border-[#dfe7f1] bg-white">
				<CardContent className="p-0">
					<div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center">
						<div className="relative flex-1">
							<Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#667085]" />
							<Input
								className="h-12 rounded-xl border-[#d8e0ea] bg-white pl-11 shadow-none focus-visible:border-[#f05a28]/45"
								onChange={(event) => {
									setSearch(event.target.value);
									setPage(1);
								}}
								placeholder="Buscar por nome, e-mail, telefone ou CPF"
								value={search}
							/>
						</div>
						<div className="flex flex-wrap gap-3">
							<select
								className="h-12 rounded-xl border border-[#d8e0ea] bg-white px-4 text-sm text-[#101828] outline-none"
								onChange={(event) => {
									setSelectedStatus(
										event.target.value as CustomerCatalogStatus | '',
									);
									setPage(1);
								}}
								value={selectedStatus}
							>
								<option value="">Todos os status</option>
								{statusOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
							<select
								className="h-12 rounded-xl border border-[#d8e0ea] bg-white px-4 text-sm text-[#101828] outline-none"
								onChange={(event) => {
									setSelectedStoreId(event.target.value);
									setPage(1);
								}}
								value={selectedStoreId}
							>
								<option value="">Todas as lojas</option>
								{stores.map((store) => (
									<option key={store.id} value={store.id}>
										{store.name}
									</option>
								))}
							</select>
							<div className="flex items-center gap-3">
								<span className="text-sm whitespace-nowrap text-[#667085]">
									Ordenar por
								</span>
								<select
									className="h-12 rounded-xl border border-[#d8e0ea] bg-white px-4 text-sm text-[#101828] outline-none"
									onChange={(event) => {
										setSort(event.target.value as CustomerCatalogSort);
										setPage(1);
									}}
									value={sort}
								>
									{sortOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{catalogQuery.isLoading ? (
						<div className="border-t border-[#e7edf5] px-7 py-10 text-sm text-[#667085]">
							Carregando clientes...
						</div>
					) : catalogQuery.isError ? (
						<div className="border-t border-destructive/20 bg-destructive/5 px-7 py-4 text-sm text-destructive">
							{humanizePageApiError(catalogQuery.error)}
						</div>
					) : (
						<CustomersTable
							currentPage={catalog?.page ?? page}
							items={items}
							onDelete={(item) => {
								setDeleteError(null);
								setDeleteTarget(item.customer);
							}}
							onEdit={openEditDialog}
							onNextPage={() => setPage((value) => value + 1)}
							onPageChange={setPage}
							onPageSizeChange={(value) => {
								setPageSize(value);
								setPage(1);
							}}
							onPreviousPage={() => setPage((value) => value - 1)}
							onView={setDetailsTarget}
							pageSize={pageSize}
							pageSizeOptions={pageSizeOptions}
							totalItems={catalog?.total ?? 0}
							totalPages={catalog?.totalPages ?? 1}
						/>
					)}
				</CardContent>
			</Card>

			<div className="grid gap-4 xl:grid-cols-[1fr_1.25fr_1fr]">
				<BreakdownCard
					href={appRoutes.app.leads}
					items={catalog?.origins ?? []}
					title="Clientes por origem"
					total={catalog?.summary.total ?? 0}
				/>
				<BreakdownCard
					href={appRoutes.app.stores}
					items={catalog?.locations ?? []}
					title="Clientes por localização"
					total={catalog?.summary.total ?? 0}
					variant="donut"
				/>
				<Card className="rounded-3xl border-[#dfe7f1] bg-white">
					<CardContent className="p-5">
						<div className="mb-4 flex items-start justify-between">
							<div>
								<h2 className="text-sm font-bold text-[#101828]">
									Clientes em destaque
								</h2>
								<p className="text-xs text-[#667085]">
									Clientes com mais negociações ativas.
								</p>
							</div>
							<Zap className="size-4 text-[#f05a28]" />
						</div>
						<div className="space-y-3">
							{(catalog?.highlights ?? []).map((item, index) => (
								<div
									className="grid grid-cols-[1.75rem_2rem_1fr_auto] items-center gap-2 text-sm"
									key={item.customer.id}
								>
									{index === 0 ? (
										<span className="text-sm font-bold text-[#f05a28]">1</span>
									) : (
										<span className="text-xs font-semibold text-[#f05a28]">
											{index + 1}
										</span>
									)}
									<span className="flex size-8 items-center justify-center rounded-full bg-[#f1f4f8] text-[0.65rem] font-semibold text-[#667085]">
										{item.customer.name
											.split(/\s+/)
											.slice(0, 2)
											.map((part) => part[0])
											.join('')
											.toUpperCase()}
									</span>
									<span className="truncate font-medium text-[#101828]">
										{item.customer.name}
									</span>
									<span className="flex items-center justify-end gap-1 font-semibold text-[#101828]">
										{formatCurrency(item.totalDealValue)}
										{index === 0 ? (
											<Flame className="size-3.5 fill-[#f05a28] text-[#f05a28]" />
										) : null}
									</span>
								</div>
							))}
							{(catalog?.highlights ?? []).length === 0 ? (
								<p className="text-sm text-[#667085]">
									Nenhum destaque encontrado.
								</p>
							) : null}
						</div>
					</CardContent>
				</Card>
			</div>

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

type BreakdownCardProps = {
	href: string;
	items: readonly { readonly label: string; readonly count: number }[];
	title: string;
	total: number;
	variant?: 'bars' | 'donut';
};

function BreakdownCard({
	href,
	items,
	title,
	total,
	variant = 'bars',
}: BreakdownCardProps) {
	return (
		<Card className="h-full rounded-3xl border-[#dfe7f1] bg-white">
			<CardContent className="flex h-full flex-col p-5">
				<div className="mb-4 flex items-start justify-between">
					<div>
						<h2 className="text-sm font-bold text-[#101828]">{title}</h2>
						<p className="text-xs text-[#667085]">
							{variant === 'donut'
								? 'Distribuição por loja vinculada.'
								: 'Canais que mais geram clientes.'}
						</p>
					</div>
					<Link
						className="text-xs font-semibold text-[#f05a28] hover:text-[#df4f1f] hover:underline"
						href={href}
						style={{ color: '#f05a28' }}
					>
						Ver todos
					</Link>
				</div>
				<div
					className={
						variant === 'donut'
							? 'grid flex-1 items-center gap-6 md:grid-cols-[1.15fr_0.85fr]'
							: 'flex-1'
					}
				>
					<div className={variant === 'donut' ? 'space-y-3' : 'space-y-4'}>
						{items.map((item) => {
							const percentage =
								total > 0 ? Math.round((item.count / total) * 100) : 0;
							return (
								<div
									className={
										variant === 'donut'
											? 'grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[#eef2f6] pb-2 last:border-b-0'
											: 'grid grid-cols-[minmax(8rem,1fr)_minmax(10rem,1.3fr)_auto] items-center gap-4'
									}
									key={item.label}
								>
									<div className="grid min-w-0 grid-cols-[1.25rem_1fr] items-center gap-2">
										<span className="flex size-5 items-center justify-center">
											<SourceIcon value={item.label} />
										</span>
										<p className="truncate text-sm font-medium text-[#344054]">
											{sourceLabel(item.label)}
										</p>
									</div>
									{variant === 'donut' ? null : (
										<div className="mt-2 h-1.5 rounded-full bg-[#eef2f6]">
											<div
												className="h-1.5 rounded-full bg-[#f05a28]"
												style={{ width: `${Math.max(4, percentage)}%` }}
											/>
										</div>
									)}
									<span className="text-sm font-semibold text-[#667085]">
										{percentage}% ({item.count})
									</span>
								</div>
							);
						})}
						{items.length === 0 ? (
							<p className="text-sm text-[#667085]">Sem dados suficientes.</p>
						) : null}
					</div>
					{variant === 'donut' ? (
						<div className="flex items-center justify-center">
							<div className="relative flex size-40 items-center justify-center rounded-full bg-[conic-gradient(#f05a28_0_42%,#7c3aed_42%_62%,#22c55e_62%_78%,#64748b_78%_100%)]">
								<div className="flex size-24 flex-col items-center justify-center rounded-full bg-white">
									<span className="text-2xl font-bold text-[#101828]">
										{formatCount(total)}
									</span>
									<span className="text-xs text-[#667085]">Total</span>
								</div>
							</div>
						</div>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}

export { CustomersManagementScreen };
