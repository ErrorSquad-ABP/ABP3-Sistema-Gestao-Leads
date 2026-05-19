'use client';

import { useQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { fetchLeadCatalog } from '@/features/leads/api/leads.service';
import { useLeadOwnersQuery } from '@/features/leads/hooks/leads.catalog.queries';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import {
	useCreateStoreMutation,
	useDeleteStoreMutation,
	useUpdateStoreMutation,
} from '@/features/stores/hooks/stores.mutations';
import { useStoresQuery } from '@/features/stores/hooks/stores.queries';
import type { StoreRecord } from '@/features/stores/model/stores.model';

import {
	getPersonInitials,
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
import { StoresInsightsAside } from './StoresInsightsAside';

type StoresManagementScreenProps = {
	user: AuthenticatedUser;
};

function parseCatalogMoney(value: string): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function StoresManagementScreen({ user }: StoresManagementScreenProps) {
	const storesQuery = useStoresQuery();
	const ownersQuery = useLeadOwnersQuery();
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
					conversionRate: catalog.summary.conversionRate,
					openDeals: catalog.funnel.openDeals,
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
			{
				converted: number;
				conversionRate: number;
				openDeals: number;
				total: number;
				wonValue: number;
			}
		>();
		for (const query of leadCountQueries) {
			if (query.data) {
				metrics.set(query.data.storeId, {
					converted: query.data.converted,
					conversionRate: query.data.conversionRate,
					openDeals: query.data.openDeals,
					total: query.data.total,
					wonValue: query.data.wonValue,
				});
			}
		}
		return metrics;
	}, [leadCountQueries]);

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

	function handleExport() {
		const headers = [
			'Loja',
			'Cidade/Estado',
			'Responsavel',
			'Leads',
			'Negociacoes abertas',
			'Conversao',
			'Status',
		];
		const csvRows = filteredRows.map((row) =>
			[
				row.store.name,
				row.cityState,
				row.ownerName,
				String(row.leadCount),
				String(row.openDealsCount),
				`${row.conversionRate}%`,
				'Ativa',
			]
				.map((value) => `"${value.replaceAll('"', '""')}"`)
				.join(','),
		);
		const blob = new Blob([[headers.join(','), ...csvRows].join('\n')], {
			type: 'text/csv;charset=utf-8',
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'lojas.csv';
		link.click();
		URL.revokeObjectURL(url);
	}

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
				onExport={handleExport}
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

			<StoresCatalogCard
				canManageStores={canManageStores}
				errorMessage={
					storesQuery.isError ? getStoresErrorMessage(storesQuery.error) : null
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
				page={safePage}
				rows={paginatedRows}
				totalPages={totalPages}
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
