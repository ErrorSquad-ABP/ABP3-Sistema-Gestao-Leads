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
import { AppTableFilterDropdown } from '@/components/data/AppTableFilterDropdown';
import {
	AppPageHeader,
	appPageActionClass,
	appPageSearchClass,
} from '@/components/layout/AppPageHeader';
import { KpiCard, type KpiCardVariant } from '@/components/metrics/KpiCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useStoresQuery } from '@/features/stores/hooks/stores.queries';
import { ApiError } from '@/lib/http/api-error';
import { showCrudSuccessToast } from '@/lib/feedback/crud-success-toast';

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
import {
	humanizeFormApiError,
	humanizePageApiError,
} from '@/lib/http/humanize-api-error';

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
			variant: 'neutral' as KpiCardVariant,
		},
		{
			label: 'Disponíveis',
			value: summary.available,
			helper: `${summary.total > 0 ? Math.round((summary.available / summary.total) * 100) : 0}% do total`,
			icon: CheckCircle2,
			variant: 'success' as KpiCardVariant,
		},
		{
			label: 'Reservados',
			value: summary.reserved,
			helper: `${summary.total > 0 ? Math.round((summary.reserved / summary.total) * 100) : 0}% do total`,
			icon: Timer,
			variant: 'warning' as KpiCardVariant,
		},
		{
			label: 'Vendidos',
			value: summary.sold,
			helper: `${summary.total > 0 ? Math.round((summary.sold / summary.total) * 100) : 0}% do total`,
			icon: ShieldCheck,
			variant: 'brand' as KpiCardVariant,
		},
		{
			label: 'Inativos',
			value: summary.inactive,
			helper: `${summary.total > 0 ? Math.round((summary.inactive / summary.total) * 100) : 0}% do total`,
			icon: Archive,
			variant: 'neutral' as KpiCardVariant,
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
			showCrudSuccessToast('vehicle', 'updated', {
				message: 'Veículo desativado com sucesso.',
			});
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
			showCrudSuccessToast('vehicle', 'deleted');
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
			<AppPageHeader
				action={
					<Button className={appPageActionClass} onClick={openCreateDialog}>
						<Plus className="size-4" />
						Novo veículo
					</Button>
				}
				controls={
					<div className="relative w-full sm:w-[440px]">
						<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#667085]" />
						<Input
							className={appPageSearchClass}
							onChange={(event) => {
								setSearch(event.target.value);
								setPage(1);
							}}
							placeholder="Buscar por marca, modelo, placa ou VIN..."
							value={search}
						/>
					</div>
				}
				description="Gerencie o catálogo de veículos da sua loja."
				title="Veículos"
			/>

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
				{metrics.map((metric) => {
					const Icon = metric.icon;
					return (
						<KpiCard
							description={metric.helper}
							icon={<Icon className="size-5" />}
							key={metric.label}
							title={metric.label}
							value={formatCount(metric.value)}
							variant={metric.variant}
						/>
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
					<div className="flex flex-wrap items-center gap-2" ref={filtersRef}>
						<div className="flex flex-1 flex-wrap items-center gap-2">
							<AppTableFilterDropdown
								defaultValue="ALL"
								label="Loja"
								onValueChange={(value) => {
									setStoreFilter(value);
									setPage(1);
								}}
								options={[
									{ value: 'ALL', label: 'Todas as lojas' },
									...stores.map((store) => ({
										value: store.id,
										label: store.name,
									})),
								]}
								value={storeFilter}
							/>
							<AppTableFilterDropdown
								defaultValue="ALL"
								label="Status"
								onValueChange={(value) => {
									setStatusFilter(value as 'ALL' | VehicleStatus);
									setPage(1);
								}}
								options={[
									{ value: 'ALL', label: 'Todos os status' },
									...vehicleStatusOptions,
								]}
								value={statusFilter}
							/>
						</div>

						<div className="inline-flex rounded-lg border border-[#d6dce5] bg-white p-1">
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

						<div className="ml-auto flex flex-wrap items-center gap-2">
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
							<AppTableFilterDropdown
								defaultValue="recent"
								kind="sort"
								label="Ordem"
								onValueChange={(value) => {
									setSort(value as VehicleCatalogSort);
									setPage(1);
								}}
								options={sortOptions}
								value={sort}
							/>
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
