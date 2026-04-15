'use client';

import { Building2, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import {
	useCreateStoreMutation,
	useDeleteStoreMutation,
	useUpdateStoreMutation,
} from '@/features/stores/hooks/stores.mutations';
import { useStoresQuery } from '@/features/stores/hooks/stores.queries';
import type { StoreRecord } from '@/features/stores/model/stores.model';
import { isApiError } from '@/lib/http/api-error';
import {
	emptyStoreName,
	StoreDeleteDialog,
	StoreFormDialog,
	toStorePayload,
	type StoreDialogState,
} from './StoreForm';
import { StoresTable } from './StoresTable';

type StoresManagementScreenProps = {
	user: AuthenticatedUser;
};

function getStoresErrorMessage(error: unknown) {
	if (!isApiError(error)) {
		return 'Não foi possível concluir a operação agora.';
	}
	return error.message;
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

	const canManageStores =
		user.role === 'ADMINISTRATOR' || user.role === 'GENERAL_MANAGER';
	const stores = useMemo(() => storesQuery.data ?? [], [storesQuery.data]);

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
		<div className="space-y-6">
			<Card className="overflow-hidden rounded-[1.75rem] border-border/90 bg-white">
				<CardHeader className="gap-5 border-none pb-6">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-3">
							<div className="flex size-12 items-center justify-center rounded-2xl border border-[#d96c3f]/16 bg-[#d96c3f]/10 text-[#d96c3f]">
								<Building2 className="size-5" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
									Workspace
								</p>
								<CardTitle className="text-[1.9rem] font-semibold tracking-tight">
									Lojas
								</CardTitle>
								<p className="max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
									Mantenha a estrutura operacional disponível para distribuição
									e governança dos leads.
								</p>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					<Card className="rounded-[1.5rem] border-border/85 bg-white">
						<CardHeader className="gap-4">
							<div className="space-y-2">
								<div className="flex size-11 items-center justify-center rounded-2xl border border-[#d96c3f]/16 bg-[#d96c3f]/10 text-[#d96c3f]">
									<Building2 className="size-5" />
								</div>
								<CardTitle className="text-[1.4rem]">
									Cadastro de lojas
								</CardTitle>
								<p className="text-[0.95rem] leading-7 text-muted-foreground">
									Use esta área para manter as lojas com nomes legíveis e
									disponíveis para o pipeline comercial.
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									className="rounded-md bg-[#2D3648] shadow-none hover:bg-[#232B3B]"
									disabled={!canManageStores}
									onClick={openCreateStoreDialog}
									size="sm"
								>
									<Plus className="size-4" />
									Nova loja
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-4 pt-0">
							{storesQuery.isLoading ? (
								<div className="rounded-2xl border border-border/80 bg-muted/20 px-4 py-8 text-sm text-muted-foreground">
									Carregando lojas...
								</div>
							) : storesQuery.isError ? (
								<div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
									{getStoresErrorMessage(storesQuery.error)}
								</div>
							) : (
								<StoresTable
									canManageStores={canManageStores}
									onDelete={(store) => {
										setDeleteError(null);
										setDeleteTarget(store);
									}}
									onEdit={openEditStoreDialog}
									stores={stores}
								/>
							)}
							{!canManageStores ? (
								<p className="text-sm text-muted-foreground">
									A gestão de lojas está disponível apenas para administrador e
									gerente geral.
								</p>
							) : null}
						</CardContent>
					</Card>
				</CardContent>
			</Card>

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
