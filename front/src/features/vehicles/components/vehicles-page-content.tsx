'use client';

import {
	Archive,
	Car,
	CheckCircle2,
	Download,
	Grid2X2,
	Plus,
	Search,
	ShieldCheck,
	Table2,
	Timer,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { TablePagination } from '@/components/data/TablePagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useStoresQuery } from '@/features/stores/hooks/stores.queries';
import { ApiError } from '@/lib/http/api-error';

import { useVehicleCatalogQuery } from '../hooks/vehicles.queries';
import {
	useCreateVehicleMutation,
	useDeactivateVehicleMutation,
	useDeleteVehicleMutation,
	useUpdateVehicleMutation,
} from '../hooks/vehicles.mutations';
import { vehicleStatusOptions } from '../lib/vehicle-labels';
import type {
	Vehicle,
	VehicleCatalogItem,
	VehicleCatalogSort,
	VehicleFormOutput,
	VehicleStatus,
} from '../model/vehicles.model';
import { VehicleCatalogCards } from './VehicleCatalogCards';
import { VehicleCatalogTable } from './VehicleCatalogTable';
import { VehicleConfirmDialog } from './VehicleConfirmDialog';
import { VehicleDetailsDialog } from './VehicleDetailsDialog';
import { humanizeFormApiError, humanizePageApiError } from '@/lib/http/humanize-api-error';

import { VehicleFormDialog } from './VehicleForm';

const pageSizeOptions = [6, 12, 18, 24, 48] as const;

type ViewMode = 'cards' | 'table';

const sortOptions: {
	readonly value: VehicleCatalogSort;
	readonly label: string;
}[] = [
	{ value: 'recent', label: 'Mais recentes' },
	{ value: 'interest_desc', label: 'Maior interesse' },
	{ value: 'price_desc', label: 'Maior preço' },
	{ value: 'price_asc', label: 'Menor preço' },
	{ value: 'mileage_asc', label: 'Menor KM' },
	{ value: 'mileage_desc', label: 'Maior KM' },
];

function formatCount(value: number) {
	return value.toLocaleString('pt-BR');
}

function buildCsv(items: readonly VehicleCatalogItem[]) {
	const rows = [
		[
			'Marca',
			'Modelo',
			'Versão',
			'Ano',
			'Loja',
			'Status',
			'Preço',
			'KM',
			'Interesse',
		],
		...items.map((item) => [
			item.vehicle.brand,
			item.vehicle.model,
			item.vehicle.version ?? '',
			String(item.vehicle.modelYear),
			item.storeName,
			item.vehicle.status,
			item.vehicle.price,
			String(item.vehicle.mileage),
			String(item.dealCount),
		]),
	];

	return rows
		.map((row) =>
			row.map((value) => `"${value.replaceAll('"', '""')}"`).join(','),
		)
		.join('\n');
}

function VehiclesPageContent() {
	const storesQuery = useStoresQuery();
	const stores = useMemo(() => storesQuery.data ?? [], [storesQuery.data]);
	const storeLabelById = useMemo(
		() => Object.fromEntries(stores.map((store) => [store.id, store.name])),
		[stores],
	);

	const [search, setSearch] = useState('');
	const [storeFilter, setStoreFilter] = useState<string>('ALL');
	const [statusFilter, setStatusFilter] = useState<'ALL' | VehicleStatus>(
		'ALL',
	);
	const [sort, setSort] = useState<VehicleCatalogSort>('recent');
	const [viewMode, setViewMode] = useState<ViewMode>('cards');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState<(typeof pageSizeOptions)[number]>(6);
	const filtersRef = useRef<HTMLDivElement>(null);

	const catalogQuery = useVehicleCatalogQuery({
		storeId: storeFilter === 'ALL' ? undefined : storeFilter,
		status: statusFilter === 'ALL' ? undefined : statusFilter,
		search,
		sort,
		page,
		limit: pageSize,
	});

	const createVehicleMutation = useCreateVehicleMutation();
	const updateVehicleMutation = useUpdateVehicleMutation();
	const deactivateVehicleMutation = useDeactivateVehicleMutation();
	const deleteVehicleMutation = useDeleteVehicleMutation();

	const [vehicleFormMode, setVehicleFormMode] = useState<'create' | 'edit'>(
		'create',
	);
	const [vehicleFormOpen, setVehicleFormOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [hardDeleteOpen, setHardDeleteOpen] = useState(false);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [targetVehicle, setTargetVehicle] = useState<Vehicle | null>(null);
	const [detailsOpen, setDetailsOpen] = useState(false);

	const catalog = catalogQuery.data;
	const items = catalog?.items ?? [];
	const summary = catalog?.summary ?? {
		total: 0,
		available: 0,
		reserved: 0,
		sold: 0,
		inactive: 0,
		highInterest: 0,
	};

	const metrics = [
		{
			label: 'Total de veículos',
			value: summary.total,
			helper: 'Em todas as lojas',
			icon: Car,
			className: 'bg-sky-50 text-sky-700',
		},
		{
			label: 'Disponíveis',
			value: summary.available,
			helper: `${summary.total > 0 ? Math.round((summary.available / summary.total) * 100) : 0}% do total`,
			icon: CheckCircle2,
			className: 'bg-emerald-50 text-emerald-700',
		},
		{
			label: 'Reservados',
			value: summary.reserved,
			helper: `${summary.total > 0 ? Math.round((summary.reserved / summary.total) * 100) : 0}% do total`,
			icon: Timer,
			className: 'bg-orange-50 text-orange-700',
		},
		{
			label: 'Vendidos',
			value: summary.sold,
			helper: `${summary.total > 0 ? Math.round((summary.sold / summary.total) * 100) : 0}% do total`,
			icon: ShieldCheck,
			className: 'bg-violet-50 text-violet-700',
		},
		{
			label: 'Inativos',
			value: summary.inactive,
			helper: `${summary.total > 0 ? Math.round((summary.inactive / summary.total) * 100) : 0}% do total`,
			icon: Archive,
			className: 'bg-slate-100 text-slate-600',
		},
	];

	function openCreateDialog() {
		setDialogError(null);
		setTargetVehicle(null);
		setVehicleFormMode('create');
		setVehicleFormOpen(true);
	}

	function openEditDialog(vehicle: Vehicle) {
		setDialogError(null);
		setTargetVehicle(vehicle);
		setVehicleFormMode('edit');
		setVehicleFormOpen(true);
	}

	function openDeactivateDialog(vehicle: Vehicle) {
		setDialogError(null);
		setTargetVehicle(vehicle);
		setDeleteOpen(true);
	}

	function openDeactivateFromForm(vehicle: Vehicle) {
		setDialogError(null);
		setVehicleFormOpen(false);
		setTargetVehicle(vehicle);
		setDeleteOpen(true);
	}

	function openHardDeleteDialog(vehicle: Vehicle) {
		setDialogError(null);
		setTargetVehicle(vehicle);
		setHardDeleteOpen(true);
	}

	function openDetailsDialog(vehicle: Vehicle) {
		setTargetVehicle(vehicle);
		setDetailsOpen(true);
	}

	async function handleVehicleFormSubmit(values: VehicleFormOutput) {
		if (vehicleFormMode === 'create') {
			await createVehicleMutation.mutateAsync({
				...values,
				version: values.version ?? null,
				color: values.color ?? null,
				manufactureYear: values.manufactureYear ?? null,
				plate: values.plate ?? null,
				vin: values.vin ?? null,
			});
			return;
		}

		if (!targetVehicle) {
			return;
		}

		const { storeId, ...valuesWithoutStore } = values;
		void storeId;

		await updateVehicleMutation.mutateAsync({
			vehicleId: targetVehicle.id,
			payload: {
				...valuesWithoutStore,
				version: values.version ?? null,
				color: values.color ?? null,
				manufactureYear: values.manufactureYear ?? null,
				plate: values.plate ?? null,
				vin: values.vin ?? null,
			},
		});
	}

	async function handleDeactivateConfirm() {
		if (!targetVehicle) {
			return;
		}

		setDialogError(null);
		try {
			await deactivateVehicleMutation.mutateAsync(targetVehicle.id);
			setDeleteOpen(false);
			setTargetVehicle(null);
		} catch (error) {
			setDialogError(humanizeFormApiError(error));
		}
	}

	async function handleHardDeleteConfirm() {
		if (!targetVehicle) {
			return;
		}

		setDialogError(null);
		try {
			await deleteVehicleMutation.mutateAsync(targetVehicle.id);
			setHardDeleteOpen(false);
			setTargetVehicle(null);
		} catch (error) {
			setDialogError(humanizeFormApiError(error));
		}
	}

	function handleExport() {
		const csv = buildCsv(items);
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = 'veiculos.csv';
		anchor.click();
		URL.revokeObjectURL(url);
	}

	const isPending = catalogQuery.isPending || storesQuery.isPending;

	return (
		<div className="space-y-6" aria-busy={isPending ? 'true' : 'false'}>
			<section className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
				<div>
					<h1 className="text-3xl font-semibold text-[#101828]">Veículos</h1>
					<p className="mt-1 text-sm text-[#667085]">
						Gerencie o catálogo de veículos da sua loja.
					</p>
				</div>
				<div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
					<div className="relative min-w-0 flex-1 xl:w-md">
						<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#667085]" />
						<Input
							className="h-11 rounded-lg border-[#d6dce5] bg-white pl-9 shadow-none"
							onChange={(event) => {
								setSearch(event.target.value);
								setPage(1);
							}}
							placeholder="Buscar por marca, modelo, placa ou VIN..."
							value={search}
						/>
					</div>
					<Button
						className="h-11 rounded-lg bg-[#f05a28] px-5 shadow-none hover:bg-[#de4f20]"
						onClick={openCreateDialog}
					>
						<Plus className="size-4" />
						Novo veículo
					</Button>
				</div>
			</section>

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
				{metrics.map((metric) => {
					const Icon = metric.icon;
					return (
						<Card
							key={metric.label}
							className="rounded-xl border-[#dde4ed] bg-white shadow-sm"
						>
							<CardContent className="flex items-center gap-4 p-5">
								<div
									className={`flex size-14 items-center justify-center rounded-full ${metric.className}`}
								>
									<Icon className="size-6" />
								</div>
								<div>
									<p className="text-sm text-[#667085]">{metric.label}</p>
									<p className="mt-1 text-2xl font-semibold text-[#101828]">
										{formatCount(metric.value)}
									</p>
									<p className="mt-1 text-xs text-[#667085]">{metric.helper}</p>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</section>

			{storesQuery.isError ? (
				<div
					className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					{storesQuery.error instanceof ApiError
						? humanizePageApiError(storesQuery.error)
						: 'Não foi possível carregar as lojas.'}
				</div>
			) : null}

			{catalogQuery.isError ? (
				<div
					className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					{catalogQuery.error instanceof ApiError
						? humanizePageApiError(catalogQuery.error)
						: 'Não foi possível carregar os veículos.'}
				</div>
			) : null}

			<Card className="rounded-xl border-[#dde4ed] bg-white shadow-sm">
				<CardContent className="space-y-5 p-4">
					<div
						className="grid gap-4 xl:grid-cols-[1fr_auto_1fr] xl:items-center"
						ref={filtersRef}
					>
						<div className="flex flex-col gap-3 sm:flex-row xl:justify-self-start">
							<select
								className="h-10 rounded-lg border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] outline-none"
								onChange={(event) => {
									setStoreFilter(event.target.value);
									setPage(1);
								}}
								value={storeFilter}
							>
								<option value="ALL">Todas as lojas</option>
								{stores.map((store) => (
									<option key={store.id} value={store.id}>
										{store.name}
									</option>
								))}
							</select>
							<select
								className="h-10 rounded-lg border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] outline-none"
								onChange={(event) => {
									setStatusFilter(event.target.value as 'ALL' | VehicleStatus);
									setPage(1);
								}}
								value={statusFilter}
							>
								<option value="ALL">Todos os status</option>
								{vehicleStatusOptions.map((status) => (
									<option key={status.value} value={status.value}>
										{status.label}
									</option>
								))}
							</select>
						</div>

						<div className="inline-flex justify-self-start rounded-lg border border-[#d6dce5] bg-white p-1 sm:justify-self-center">
							<Button
								className={
									viewMode === 'cards'
										? 'bg-orange-50 text-[#f05a28] hover:bg-orange-50'
										: ''
								}
								onClick={() => setViewMode('cards')}
								size="sm"
								variant="ghost"
							>
								<Grid2X2 className="size-4" />
								Cards
							</Button>
							<Button
								className={
									viewMode === 'table'
										? 'bg-orange-50 text-[#f05a28] hover:bg-orange-50'
										: ''
								}
								onClick={() => setViewMode('table')}
								size="sm"
								variant="ghost"
							>
								<Table2 className="size-4" />
								Tabela
							</Button>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:justify-self-end">
							{viewMode === 'table' ? (
								<Button
									className="rounded-lg border-[#d6dce5]"
									onClick={handleExport}
									variant="outline"
								>
									<Download className="size-4" />
									Exportar
								</Button>
							) : null}
							<div className="flex items-center gap-2">
								<span className="text-sm text-[#667085]">Ordenar por</span>
								<select
									className="h-10 rounded-lg border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] outline-none"
									onChange={(event) => {
										setSort(event.target.value as VehicleCatalogSort);
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

					{isPending ? (
						<div className="rounded-xl border border-[#dde4ed] bg-[#f8fafc] px-4 py-12 text-center text-sm text-[#667085]">
							Carregando veículos...
						</div>
					) : viewMode === 'cards' ? (
						<VehicleCatalogCards
							items={items}
							onDeactivate={openDeactivateDialog}
							onDelete={openHardDeleteDialog}
							onEdit={openEditDialog}
							onOpenDetails={openDetailsDialog}
						/>
					) : (
						<VehicleCatalogTable
							items={items}
							onDeactivate={openDeactivateDialog}
							onDelete={openHardDeleteDialog}
							onEdit={openEditDialog}
							onOpenDetails={openDetailsDialog}
						/>
					)}

					<TablePagination
						className="px-0 pb-0"
						isLoading={catalogQuery.isFetching}
						itemLabel="veículos"
						onPageChange={setPage}
						onPageSizeChange={(value) => {
							setPageSize(value as (typeof pageSizeOptions)[number]);
							setPage(1);
						}}
						page={catalog?.page ?? page}
						pageSize={pageSize}
						pageSizeOptions={pageSizeOptions}
						totalItems={catalog?.total ?? 0}
						totalPages={catalog?.totalPages ?? 1}
					/>
				</CardContent>
			</Card>

			<VehicleFormDialog
				isPending={
					vehicleFormMode === 'create'
						? createVehicleMutation.isPending
						: updateVehicleMutation.isPending
				}
				mode={vehicleFormMode}
				onClose={() => {
					setVehicleFormOpen(false);
					setTargetVehicle(null);
				}}
				onRequestDeactivate={openDeactivateFromForm}
				onSubmit={handleVehicleFormSubmit}
				open={vehicleFormOpen}
				stores={stores}
				targetVehicle={targetVehicle}
			/>

			<VehicleConfirmDialog
				confirmLabel="Inativar veículo"
				description={
					targetVehicle
						? `O veículo «${targetVehicle.brand} ${targetVehicle.model}» será marcado como inativo.`
						: 'Confirme a inativação do veículo selecionado.'
				}
				error={dialogError}
				isPending={deactivateVehicleMutation.isPending}
				onClose={() => {
					setDeleteOpen(false);
					setTargetVehicle(null);
					setDialogError(null);
				}}
				onConfirm={handleDeactivateConfirm}
				open={deleteOpen}
				title="Inativar veículo"
			/>

			<VehicleConfirmDialog
				confirmLabel="Excluir permanentemente"
				description={
					targetVehicle
						? `O veículo «${targetVehicle.brand} ${targetVehicle.model}» será excluído definitivamente. Essa ação só é permitida quando não há negociações vinculadas.`
						: 'Confirme a exclusão permanente do veículo selecionado.'
				}
				error={dialogError}
				isPending={deleteVehicleMutation.isPending}
				onClose={() => {
					setHardDeleteOpen(false);
					setTargetVehicle(null);
					setDialogError(null);
				}}
				onConfirm={handleHardDeleteConfirm}
				open={hardDeleteOpen}
				title="Excluir veículo"
			/>

			<VehicleDetailsDialog
				onClose={() => {
					setDetailsOpen(false);
					setTargetVehicle(null);
				}}
				open={detailsOpen}
				storeLabelById={storeLabelById}
				vehicle={targetVehicle}
			/>
		</div>
	);
}

export { VehiclesPageContent };
