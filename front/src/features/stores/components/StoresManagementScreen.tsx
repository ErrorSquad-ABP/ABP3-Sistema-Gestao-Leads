'use client';

import { useQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { fetchLeadCatalog } from '@/features/leads/api/leads.service';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import {
	useCreateStoreMutation,
	useDeleteStoreMutation,
	useUpdateStoreMutation,
} from '@/features/stores/hooks/stores.mutations';
import { useStoresQuery } from '@/features/stores/hooks/stores.queries';
import type { StoreRecord } from '@/features/stores/model/stores.model';

import {
	getStoreInitials,
	getStoresErrorMessage,
	normalizeSearch,
	resolveStoreProfile,
	stateLabels,
	STORES_PAGE_SIZE,
	type StoreTableRow,
} from '../lib/store-catalog-view';
import {
	emptyStoreName,
	StoreDeleteDialog,
	StoreFormDialog,
	toStorePayload,
	type StoreDialogState,
} from './StoreForm';
import { StoresCatalogCard } from './StoresCatalogCard';
import { StoresMetricsGrid, StoresPageHeader } from './StoresHeaderMetrics';
import {
	StoresDistributionCard,
	StoresInsightsAside,
	type DistributionItem,
} from './StoresInsightsAside';

type StoresManagementScreenProps = {
	user: AuthenticatedUser;
};

function parseCatalogMoney(value: string): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function StoresManagementScreen({ user }: StoresManagementScreenProps) {
	const storesQuery = useStoresQuery();
	const createStoreMutation = useCreateStoreMutation();
	const updateStoreMutation = useUpdateStoreMutation();
	const deleteStoreMutation = useDeleteStoreMutation();

	const [storeDialogState, setStoreDialogState] =
		useState<StoreDialogState | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<StoreRecord | null>(null);
	const [storeName, setStoreName] = useState(emptyStoreName);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [search, setSearch] = useState('');
	const [regionFilter, setRegionFilter] = useState('ALL');
	const [page, setPage] = useState(1);

	const canManageStores =
		user.role === 'ADMINISTRATOR' || user.role === 'GENERAL_MANAGER';
	const stores = useMemo(() => storesQuery.data ?? [], [storesQuery.data]);

	const leadCountQueries = useQueries({
		queries: stores.map((store) => ({
			enabled: stores.length > 0,
			queryFn: async ({ signal }: { signal: AbortSignal }) => {
				const catalog = await fetchLeadCatalog(
					{ limit: 1, page: 1, sort: 'recent', storeId: store.id },
					signal,
				);
				return {
					converted: catalog.summary.converted,
					storeId: store.id,
					total: catalog.total,
					wonValue: parseCatalogMoney(catalog.summary.wonValue),
				};
			},
			queryKey: ['stores', 'lead-count', store.id],
		})),
	});

	const leadMetricsByStoreId = useMemo(() => {
		const metrics = new Map<
			string,
			{ converted: number; total: number; wonValue: number }
		>();
		for (const query of leadCountQueries) {
			if (query.data) {
				metrics.set(query.data.storeId, {
					converted: query.data.converted,
					total: query.data.total,
					wonValue: query.data.wonValue,
				});
			}
		}
		return metrics;
	}, [leadCountQueries]);

	const rows = useMemo<StoreTableRow[]>(
		() =>
			stores.map((store) => {
				const profile = resolveStoreProfile(store);
				const metrics = leadMetricsByStoreId.get(store.id);
				return {
					...profile,
					convertedLeadCount: metrics?.converted ?? 0,
					initials: getStoreInitials(store.name),
					leadCount: metrics?.total ?? 0,
					store,
					wonValue: metrics?.wonValue ?? 0,
				};
			}),
		[leadMetricsByStoreId, stores],
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
					`${row.store.name} ${row.region} ${row.scope} ${row.state}`,
				).includes(searchTerm);
			const matchesRegion =
				regionFilter === 'ALL' || row.state === regionFilter;
			return matchesSearch && matchesRegion;
		});
	}, [regionFilter, rows, search]);

	const totalPages = Math.max(
		1,
		Math.ceil(filteredRows.length / STORES_PAGE_SIZE),
	);
	const safePage = Math.min(page, totalPages);
	const paginatedRows = filteredRows.slice(
		(safePage - 1) * STORES_PAGE_SIZE,
		safePage * STORES_PAGE_SIZE,
	);
	const uniqueStates = useMemo(
		() => [...new Set(rows.map((row) => row.state))],
		[rows],
	);
	const storeDistribution = useMemo<DistributionItem[]>(
		() =>
			uniqueStates.map((state) => ({
				count: rows.filter((row) => row.state === state).length,
				label: state,
			})),
		[rows, uniqueStates],
	);
	const leadDistribution = useMemo<DistributionItem[]>(
		() =>
			uniqueStates.map((state) => ({
				count: rows
					.filter((row) => row.state === state)
					.reduce((total, row) => total + row.leadCount, 0),
				label: state,
			})),
		[rows, uniqueStates],
	);
	const totalLeadCount = rows.reduce((total, row) => total + row.leadCount, 0);
	const totalConvertedLeads = rows.reduce(
		(total, row) => total + row.convertedLeadCount,
		0,
	);
	const totalWonValue = rows.reduce((total, row) => total + row.wonValue, 0);
	const averageLeads = stores.length
		? Math.round(totalLeadCount / stores.length)
		: 0;
	const topStore = rows.reduce<StoreTableRow | null>(
		(best, row) =>
			best === null || row.leadCount > best.leadCount ? row : best,
		null,
	);
	const topConvertedStore = rows
		.filter((row) => row.convertedLeadCount > 0)
		.reduce<StoreTableRow | null>(
			(best, row) =>
				best === null || row.convertedLeadCount > best.convertedLeadCount
					? row
					: best,
			null,
		);
	const topRevenueStore = rows
		.filter((row) => row.wonValue > 0)
		.reduce<StoreTableRow | null>(
			(best, row) =>
				best === null || row.wonValue > best.wonValue ? row : best,
			null,
		);
	function openCreateStoreDialog() {
		setDialogError(null);
		setStoreName(emptyStoreName);
		setStoreDialogState({ mode: 'create', store: null });
	}

	function openEditStoreDialog(store: StoreRecord) {
		setDialogError(null);
		setStoreName(store.name);
		setStoreDialogState({ mode: 'edit', store });
	}

	async function handleStoreSubmit() {
		const payload = toStorePayload(storeName);
		if (!payload) {
			setDialogError('Informe o nome da loja.');
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
			setStoreName(emptyStoreName);
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
			/>

			<StoresMetricsGrid
				activeStores={stores.length}
				averageLeads={averageLeads}
				storesCount={stores.length}
				uniqueStates={uniqueStates}
			/>

			<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
				<StoresCatalogCard
					canManageStores={canManageStores}
					errorMessage={
						storesQuery.isError
							? getStoresErrorMessage(storesQuery.error)
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
					onRegionFilterChange={(value) => {
						setRegionFilter(value);
						setPage(1);
					}}
					onSearchChange={(value) => {
						setSearch(value);
						setPage(1);
					}}
					page={safePage}
					regionFilter={regionFilter}
					regionOptions={regionOptions}
					rows={paginatedRows}
					search={search}
					totalPages={totalPages}
				/>
				<StoresDistributionCard
					distribution={storeDistribution}
					storesCount={stores.length}
				/>
			</div>

			<StoresInsightsAside
				averageLeads={averageLeads}
				coverageDistribution={leadDistribution}
				storesCount={stores.length}
				topConvertedStore={topConvertedStore}
				topRevenueStore={topRevenueStore}
				topStore={topStore}
				totalConvertedLeads={totalConvertedLeads}
				totalLeadCount={totalLeadCount}
				totalWonValue={totalWonValue}
				uniqueStatesCount={uniqueStates.length}
			/>

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
				onValueChange={setStoreName}
				value={storeName}
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
