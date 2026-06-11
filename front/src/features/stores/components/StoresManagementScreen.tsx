'use client';

import { useMemo, useState } from 'react';

import { useLeadOwnersQuery } from '@/features/leads/hooks/leads.catalog.queries';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import {
	useCreateStoreMutation,
	useDeleteStoreMutation,
	useUpdateStoreMutation,
} from '@/features/stores/hooks/stores.mutations';
import {
	useStoreMetricsQuery,
	useStoresQuery,
} from '@/features/stores/hooks/stores.queries';
import type { StoreRecord } from '@/features/stores/model/stores.model';

import {
	getPersonInitials,
	getStoreInitials,
	getStoresErrorMessage,
	getStoresPageErrorMessage,
	normalizeSearch,
	resolveStoreProfile,
	stateLabels,
	DEFAULT_STORE_PAGE_SIZE,
	type StoreTableRow,
} from '../lib/store-view';
import {
	StoreDeleteDialog,
	StoreFormDialog,
	emptyStoreFormValues,
	toStorePayload,
	type StoreDialogState,
	type StoreFormValues,
} from './StoreForm';
import { StoresCatalogCard } from './StoresCatalogCard';
import { StoresMetricsGrid, StoresPageHeader } from './StoresHeaderMetrics';
import { StoresInsightsAside } from './StoresInsightsAside';

type StoresManagementScreenProps = {
	user: AuthenticatedUser;
};

function StoresManagementScreen({ user }: StoresManagementScreenProps) {
	const storesQuery = useStoresQuery();
	const storeMetricsQuery = useStoreMetricsQuery();
	const ownersQuery = useLeadOwnersQuery();
	const createStoreMutation = useCreateStoreMutation();
	const updateStoreMutation = useUpdateStoreMutation();
	const deleteStoreMutation = useDeleteStoreMutation();

	const [storeDialogState, setStoreDialogState] =
		useState<StoreDialogState | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<StoreRecord | null>(null);
	const [storeFormValues, setStoreFormValues] =
		useState<StoreFormValues>(emptyStoreFormValues);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [search, setSearch] = useState('');
	const [regionFilter, setRegionFilter] = useState('ALL');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_STORE_PAGE_SIZE);

	const canManageStores =
		user.role === 'ADMINISTRATOR' || user.role === 'GENERAL_MANAGER';
	const stores = useMemo(() => storesQuery.data ?? [], [storesQuery.data]);

	const leadMetricsByStoreId = useMemo(() => {
		const metrics = new Map<
			string,
			{
				converted: number;
				conversionRate: number;
				openDeals: number;
				total: number;
				wonValue: number;
			}
		>();
		for (const item of storeMetricsQuery.data ?? []) {
			metrics.set(item.storeId, {
				converted: item.converted,
				conversionRate: item.conversionRate,
				openDeals: item.openDeals,
				total: item.total,
				wonValue: item.wonValue,
			});
		}
		return metrics;
	}, [storeMetricsQuery.data]);

	const owners = useMemo(() => ownersQuery.data ?? [], [ownersQuery.data]);
	const ownersByStoreId = useMemo(() => {
		const grouped = new Map<string, typeof owners>();
		for (const owner of owners) {
			for (const storeId of owner.storeIds) {
				const next = grouped.get(storeId) ?? [];
				next.push(owner);
				grouped.set(storeId, next);
			}
		}
		return grouped;
	}, [owners]);

	const rows = useMemo<StoreTableRow[]>(
		() =>
			stores.map((store) => {
				const profile = resolveStoreProfile(store);
				const metrics = leadMetricsByStoreId.get(store.id);
				const storeOwners = ownersByStoreId.get(store.id) ?? [];
				const primaryOwner = storeOwners[0] ?? null;
				return {
					...profile,
					convertedLeadCount: metrics?.converted ?? 0,
					conversionRate: metrics?.conversionRate ?? 0,
					initials: getStoreInitials(store.name),
					leadCount: metrics?.total ?? 0,
					openDealsCount: metrics?.openDeals ?? 0,
					ownerEmail: primaryOwner?.email ?? null,
					ownerInitials: getPersonInitials(primaryOwner?.name ?? ''),
					ownerName: primaryOwner?.name ?? 'Sem responsável',
					store,
					teamCount: Math.max(1, storeOwners.length),
					wonValue: metrics?.wonValue ?? 0,
				};
			}),
		[leadMetricsByStoreId, ownersByStoreId, stores],
	);

	const regionOptions = useMemo(() => {
		const options = new Map<string, string>();
		for (const row of rows) {
			options.set(row.state, stateLabels.get(row.state) ?? row.state);
		}
		return [...options.entries()];
	}, [rows]);

	const filteredRows = useMemo(() => {
		const searchTerm = normalizeSearch(search);
		return rows.filter((row) => {
			const matchesSearch =
				!searchTerm ||
				normalizeSearch(
					`${row.store.name} ${row.region} ${row.scope} ${row.state} ${row.cityState} ${row.addressLine} ${row.ownerName}`,
				).includes(searchTerm);
			const matchesRegion =
				regionFilter === 'ALL' || row.state === regionFilter;
			return matchesSearch && matchesRegion;
		});
	}, [regionFilter, rows, search]);

	const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
	const safePage = Math.min(page, totalPages);
	const paginatedRows = filteredRows.slice(
		(safePage - 1) * pageSize,
		safePage * pageSize,
	);
	const uniqueStates = useMemo(
		() => [...new Set(rows.map((row) => row.state))],
		[rows],
	);
	const totalLeadCount = rows.reduce((total, row) => total + row.leadCount, 0);
	const totalOpenDeals = rows.reduce(
		(total, row) => total + row.openDealsCount,
		0,
	);
	const totalConvertedLeads = rows.reduce(
		(total, row) => total + row.convertedLeadCount,
		0,
	);
	const averageLeads = stores.length
		? Math.round(totalLeadCount / stores.length)
		: 0;
	const averageConversionRate =
		totalLeadCount > 0
			? Math.round((totalConvertedLeads / totalLeadCount) * 100)
			: 0;

	function openCreateStoreDialog() {
		setDialogError(null);
		setStoreFormValues(emptyStoreFormValues);
		setStoreDialogState({ mode: 'create', store: null });
	}

	function openEditStoreDialog(store: StoreRecord) {
		setDialogError(null);
		setStoreFormValues({
			addressLine: store.addressLine ?? '',
			city: store.city ?? '',
			coverage: store.coverage ?? '',
			distributionRegion: store.distributionRegion ?? '',
			name: store.name,
			region: store.region ?? '',
			scope: store.scope ?? '',
			state: store.state ?? '',
		});
		setStoreDialogState({ mode: 'edit', store });
	}

	async function handleStoreSubmit() {
		const payload = toStorePayload(storeFormValues);
		if (!payload) {
			setDialogError('Informe o nome da loja e uma UF válida com 2 letras.');
			return;
		}

		setDialogError(null);
		try {
			if (storeDialogState?.mode === 'edit' && storeDialogState.store) {
				await updateStoreMutation.mutateAsync({
					id: storeDialogState.store.id,
					body: payload,
				});
			} else {
				await createStoreMutation.mutateAsync(payload);
			}

			setStoreDialogState(null);
			setStoreFormValues(emptyStoreFormValues);
		} catch (error) {
			setDialogError(getStoresErrorMessage(error));
		}
	}

	async function handleDeleteConfirm() {
		if (!deleteTarget) {
			return;
		}

		setDeleteError(null);
		try {
			await deleteStoreMutation.mutateAsync(deleteTarget.id);
			setDeleteTarget(null);
		} catch (error) {
			setDeleteError(getStoresErrorMessage(error));
		}
	}

	return (
		<div className="space-y-5">
			<StoresPageHeader
				canManageStores={canManageStores}
				onCreate={openCreateStoreDialog}
				onRegionFilterChange={(value) => {
					setRegionFilter(value);
					setPage(1);
				}}
				onSearchChange={(value) => {
					setSearch(value);
					setPage(1);
				}}
				regionFilter={regionFilter}
				regionOptions={regionOptions}
				search={search}
			/>

			<StoresCatalogCard
				canManageStores={canManageStores}
				errorMessage={
					storesQuery.isError
						? getStoresPageErrorMessage(storesQuery.error)
						: null
				}
				filteredCount={filteredRows.length}
				isError={storesQuery.isError}
				isLoading={storesQuery.isLoading}
				onDelete={(store) => {
					setDeleteError(null);
					setDeleteTarget(store);
				}}
				onEdit={openEditStoreDialog}
				onPageChange={setPage}
				onPageSizeChange={(nextPageSize) => {
					setPageSize(nextPageSize);
					setPage(1);
				}}
				page={safePage}
				pageSize={pageSize}
				rows={paginatedRows}
				totalPages={totalPages}
			/>

			<StoresMetricsGrid
				activeStores={stores.length}
				averageLeads={averageLeads}
				averageConversionRate={averageConversionRate}
				openDeals={totalOpenDeals}
				storesCount={stores.length}
				totalLeads={totalLeadCount}
				uniqueStates={uniqueStates}
			/>

			<StoresInsightsAside rows={rows} storesCount={stores.length} />

			<StoreFormDialog
				dialogError={dialogError}
				dialogState={storeDialogState}
				isPending={
					createStoreMutation.isPending || updateStoreMutation.isPending
				}
				onClose={() => {
					setStoreDialogState(null);
					setDialogError(null);
				}}
				onSave={() => {
					void handleStoreSubmit();
				}}
				onValueChange={(field, value) =>
					setStoreFormValues((current: StoreFormValues) => ({
						...current,
						[field]: value,
					}))
				}
				values={storeFormValues}
			/>

			<StoreDeleteDialog
				deleteError={deleteError}
				isPending={deleteStoreMutation.isPending}
				onClose={() => {
					setDeleteTarget(null);
					setDeleteError(null);
				}}
				onConfirm={() => {
					void handleDeleteConfirm();
				}}
				target={deleteTarget}
			/>
		</div>
	);
}

export { StoresManagementScreen };
