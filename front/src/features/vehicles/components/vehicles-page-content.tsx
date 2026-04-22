'use client';

import { LayoutList, Plus, Search } from 'lucide-react';
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
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { ApiError } from '@/lib/http/api-error';
import { useStoresQuery } from '@/features/stores/hooks/stores.queries';

import { useVehiclesListQuery } from '../hooks/vehicles.queries';
import {
	useCreateVehicleMutation,
	useDeactivateVehicleMutation,
	useUpdateVehicleMutation,
} from '../hooks/vehicles.mutations';
import { vehicleStatusOptions } from '../lib/vehicle-labels';
import type {
	Vehicle,
	VehicleFormOutput,
	VehicleStatus,
} from '../model/vehicles.model';
import { VehicleConfirmDialog } from './VehicleConfirmDialog';
import { VehicleDetailsDialog } from './VehicleDetailsDialog';
import { VehicleFormDialog, getVehiclesErrorMessage } from './VehicleForm';
import { VehiclesTable } from './VehiclesTable';

function normalizeSearchValue(value: string) {
	return value.trim().toLowerCase();
}

type VehiclesPageContentProps = {
	user: AuthenticatedUser;
};

function VehiclesPageContent({ user: _user }: VehiclesPageContentProps) {
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

	const vehiclesQuery = useVehiclesListQuery({
		storeId: storeFilter === 'ALL' ? undefined : storeFilter,
		status: statusFilter === 'ALL' ? undefined : statusFilter,
	});

	const createVehicleMutation = useCreateVehicleMutation();
	const updateVehicleMutation = useUpdateVehicleMutation();
	const deactivateVehicleMutation = useDeactivateVehicleMutation();

	const [vehicleFormMode, setVehicleFormMode] = useState<'create' | 'edit'>(
		'create',
	);
	const [vehicleFormOpen, setVehicleFormOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [targetVehicle, setTargetVehicle] = useState<Vehicle | null>(null);
	const [detailsOpen, setDetailsOpen] = useState(false);

	const vehicles = useMemo(
		() => vehiclesQuery.data ?? [],
		[vehiclesQuery.data],
	);

	const normalizedSearch = normalizeSearchValue(search);
	const filteredVehicles = useMemo(() => {
		if (!normalizedSearch) {
			return vehicles;
		}

		return vehicles.filter((vehicle) => {
			const haystack = [
				vehicle.id,
				storeLabelById[vehicle.storeId] ?? vehicle.storeId,
				vehicle.brand,
				vehicle.model,
				vehicle.version ?? '',
				vehicle.plate ?? '',
				vehicle.vin ?? '',
				vehicle.status,
				vehicle.supportedFuelType,
				vehicle.price,
				String(vehicle.modelYear),
			]
				.join(' ')
				.toLowerCase();

			return haystack.includes(normalizedSearch);
		});
	}, [normalizedSearch, storeLabelById, vehicles]);

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

		await updateVehicleMutation.mutateAsync({
			vehicleId: targetVehicle.id,
			payload: {
				...values,
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
			setDialogError(getVehiclesErrorMessage(error));
		}
	}

	const title = 'Gestão de veículos';
	const subtitle =
		'Cadastre e mantenha o catálogo de veículos por loja e status operacional.';

	return (
		<div
			className="space-y-6"
			aria-busy={vehiclesQuery.isPending ? 'true' : 'false'}
		>
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

			{storesQuery.isError ? (
				<div
					className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					{storesQuery.error instanceof ApiError
						? storesQuery.error.message
						: 'Não foi possível carregar as lojas.'}
				</div>
			) : null}

			{vehiclesQuery.isError ? (
				<div
					className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
					role="alert"
					aria-live="polite"
				>
					{vehiclesQuery.error instanceof ApiError
						? vehiclesQuery.error.message
						: 'Não foi possível carregar os veículos.'}
				</div>
			) : null}

			<Card className="overflow-hidden rounded-[1.75rem] border-border/90 bg-white">
				<CardHeader className="gap-5 border-none pb-6">
					<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
						<div className="space-y-2">
							<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
								Catálogo
							</p>
							<CardTitle className="text-[1.45rem] font-semibold tracking-tight">
								Lista de veículos
							</CardTitle>
							<p className="max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
								Crie, atualize e inative veículos do catálogo.
							</p>
						</div>
						<CardAction className="static self-start">
							<div className="flex flex-wrap gap-2">
								<Button
									className="rounded-md shadow-none bg-[#2D3648] hover:bg-[#232B3B]"
									onClick={openCreateDialog}
									type="button"
								>
									<Plus className="size-4" />
									Novo veículo
								</Button>
							</div>
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
								placeholder="Pesquisar por loja, marca, modelo, placa ou VIN"
								value={search}
							/>
						</div>
						<div className="flex flex-col gap-3 sm:flex-row">
							<select
								className="h-10 rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
								onChange={(event) => setStoreFilter(event.target.value)}
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
								className="h-10 rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
								onChange={(event) =>
									setStatusFilter(event.target.value as 'ALL' | VehicleStatus)
								}
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
					</div>

					<VehiclesTable
						onDeactivate={openDeactivateDialog}
						onEdit={openEditDialog}
						onOpenDetails={openDetailsDialog}
						storeLabelById={storeLabelById}
						vehicles={filteredVehicles}
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
