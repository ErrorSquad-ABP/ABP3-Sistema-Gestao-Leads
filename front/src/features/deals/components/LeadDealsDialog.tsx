'use client';

import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVehiclesListQuery } from '@/features/vehicles/hooks/vehicles.queries';
import type { Vehicle } from '@/features/vehicles/model/vehicles.model';
import { ApiError } from '@/lib/http/api-error';
import { useDealsByLeadQuery } from '../hooks/deals.queries';
import {
	useCreateDealForLeadMutation,
	useDeleteDealMutation,
	useUpdateDealMutation,
} from '../hooks/deals.mutations';
import {
	centsDigitsToApiDecimalString,
	formatCentsDigitsToBrlDisplay,
	sanitizeMoneyDigitsInput,
} from '../lib/deal-money-input';
import type {
	Deal,
	DealCreateFormInput,
	DealCreateInput,
} from '../model/deals.model';
import { dealCreateSchema } from '../schemas/deal-management.schema';
import { DealConfirmDialog } from './DealConfirmDialog';
import { DealDetailsDialog } from './DealDetailsDialog';
import { DealFormDialog, getDealsErrorMessage } from './DealFormDialog';
import { DealsTable } from './DealsTable';

type LeadDealsDialogProps = {
	leadId: string | null;
	leadStoreId?: string | null;
	onClose: () => void;
	open: boolean;
};

function formatVehicleOptionLabel(vehicle: Vehicle) {
	const plate = vehicle.plate ? vehicle.plate.trim() : '';
	return `${vehicle.brand} ${vehicle.model} ${vehicle.modelYear} · ${plate || 'Sem placa'}`;
}

function LeadDealsDialog({
	leadId,
	leadStoreId,
	onClose,
	open,
}: LeadDealsDialogProps) {
	const safeLeadId = leadId ?? '';
	const listQuery = useDealsByLeadQuery(safeLeadId, {
		enabled: open && Boolean(leadId),
	});
	const deals = useMemo(
		() => listQuery.data?.items ?? [],
		[listQuery.data?.items],
	);
	const canMutateLead = listQuery.data?.canMutateLead ?? false;
	/** Só confia no payload após sucesso: evita affordance de mutação em erro/loading. */
	const allowLeadMutations = listQuery.isSuccess && canMutateLead;

	const vehiclesQuery = useVehiclesListQuery(
		{
			status: 'AVAILABLE',
			storeId: leadStoreId ?? undefined,
		},
		{
			enabled: Boolean(leadId && leadStoreId && open && allowLeadMutations),
		},
	);
	const availableVehicles = useMemo(
		() => vehiclesQuery.data ?? [],
		[vehiclesQuery.data],
	);

	const createMutation = useCreateDealForLeadMutation(safeLeadId);
	const updateMutation = useUpdateDealMutation();
	const deleteMutation = useDeleteDealMutation();

	const [createOpen, setCreateOpen] = useState(false);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [targetDeal, setTargetDeal] = useState<Deal | null>(null);

	const [vehicleId, setVehicleId] = useState('');
	const [title, setTitle] = useState('');
	const [valueCentsDigits, setValueCentsDigits] = useState('');

	useEffect(() => {
		if (!open || !listQuery.isSuccess || canMutateLead) {
			return;
		}
		queueMicrotask(() => {
			setCreateOpen(false);
			setEditOpen(false);
			setDeleteOpen(false);
			setDialogError(null);
		});
	}, [open, listQuery.isSuccess, canMutateLead]);

	function resetCreateForm() {
		setVehicleId('');
		setTitle('');
		setValueCentsDigits('');
		setDialogError(null);
	}

	async function handleCreateSubmit() {
		if (!leadId || !allowLeadMutations) {
			return;
		}
		setDialogError(null);
		try {
			const valueAsApi = centsDigitsToApiDecimalString(valueCentsDigits);
			const parsed = dealCreateSchema.parse({
				vehicleId,
				title,
				value: valueAsApi,
			} satisfies DealCreateFormInput) as DealCreateInput;
			await createMutation.mutateAsync(parsed);
			setCreateOpen(false);
			resetCreateForm();
		} catch (error) {
			setDialogError(getDealsErrorMessage(error));
		}
	}

	function openDetails(deal: Deal) {
		setTargetDeal(deal);
		setDetailsOpen(true);
	}

	function openEdit(deal: Deal) {
		if (!deal.canMutate) {
			return;
		}
		setTargetDeal(deal);
		setEditOpen(true);
	}

	function openDelete(deal: Deal) {
		if (!deal.canMutate) {
			return;
		}
		setDialogError(null);
		setTargetDeal(deal);
		setDeleteOpen(true);
	}

	async function handleDeleteConfirm() {
		if (!targetDeal) return;
		setDialogError(null);
		try {
			await deleteMutation.mutateAsync({
				dealId: targetDeal.id,
				leadId: targetDeal.leadId,
			});
			setDeleteOpen(false);
			setTargetDeal(null);
		} catch (error) {
			setDialogError(getDealsErrorMessage(error));
		}
	}

	return (
		<>
			<Dialog
				onOpenChange={(nextOpen) => {
					if (nextOpen) return;
					setCreateOpen(false);
					setDetailsOpen(false);
					setEditOpen(false);
					setDeleteOpen(false);
					setTargetDeal(null);
					resetCreateForm();
					onClose();
				}}
				open={open}
			>
				<DialogContent className="flex max-h-[84vh] max-w-5xl flex-col overflow-hidden rounded-[1.75rem] border border-[#d8e0ea] bg-white">
					<DialogHeader className="gap-3 border-b border-[#e5ebf3] px-8 py-7">
						<div className="flex items-center justify-between gap-4">
							<div className="space-y-1">
								<p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#d96c3f]">
									Lead
								</p>
								<DialogTitle>Negociações do lead</DialogTitle>
								<DialogDescription className="max-w-2xl">
									{listQuery.isSuccess && !canMutateLead
										? 'Acompanhe as negociações deste lead. O seu perfil só tem permissão de leitura neste contexto.'
										: 'Crie e acompanhe negociações relacionadas ao lead selecionado.'}
								</DialogDescription>
							</div>
							<Button
								className="rounded-md shadow-none bg-[#2D3648] hover:bg-[#232B3B]"
								disabled={!leadId || !allowLeadMutations}
								onClick={() => {
									if (!allowLeadMutations) return;
									setCreateOpen(true);
									setDialogError(null);
								}}
								title={(() => {
									if (listQuery.isPending) {
										return 'A carregar negociações e a verificar permissões…';
									}
									if (listQuery.isError) {
										return 'Não foi possível carregar as negociações. Corrija o erro antes de criar.';
									}
									if (listQuery.isSuccess && !canMutateLead) {
										return 'Sem permissão para criar ou alterar negociações deste lead.';
									}
									return undefined;
								})()}
								type="button"
							>
								<Plus className="size-4" />
								Nova negociação
							</Button>
						</div>
					</DialogHeader>

					<div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-8 pb-8 pt-7">
						{listQuery.isError ? (
							<div
								className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
								role="alert"
							>
								{listQuery.error instanceof ApiError
									? listQuery.error.message
									: 'Não foi possível carregar as negociações do lead.'}
							</div>
						) : null}

						{listQuery.isPending ? (
							<div className="rounded-2xl border border-border/80 bg-muted/20 px-4 py-8 text-sm text-muted-foreground">
								Carregando negociações...
							</div>
						) : null}

						{listQuery.isSuccess ? (
							<DealsTable
								deals={deals}
								onDelete={
									allowLeadMutations && deals.some((d) => d.canMutate)
										? openDelete
										: undefined
								}
								onEdit={
									allowLeadMutations && deals.some((d) => d.canMutate)
										? openEdit
										: undefined
								}
								onOpenDetails={openDetails}
							/>
						) : null}
					</div>

					<DialogFooter className="px-8 pb-6 pt-4">
						<Button
							className="rounded-md"
							onClick={onClose}
							type="button"
							variant="outline"
						>
							Fechar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				onOpenChange={(nextOpen) => {
					if (nextOpen) return;
					setCreateOpen(false);
					resetCreateForm();
				}}
				open={createOpen}
			>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Nova negociação</DialogTitle>
						<DialogDescription>
							Informe veículo, título e valor. O backend valida disponibilidade
							e escopo.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 px-6 py-5">
						{dialogError ? (
							<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
								{dialogError}
							</div>
						) : null}
						<div className="space-y-2">
							<Label htmlFor="lead-deal-vehicle">Veículo</Label>
							<select
								className="h-10 w-full rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45 disabled:cursor-not-allowed disabled:opacity-60"
								disabled={!leadId || !leadStoreId || vehiclesQuery.isPending}
								id="lead-deal-vehicle"
								onChange={(e) => setVehicleId(e.target.value)}
								value={vehicleId}
							>
								<option value="">
									{vehiclesQuery.isPending
										? 'Carregando veículos disponíveis...'
										: !leadStoreId
											? 'Lead sem loja definida'
											: 'Selecione um veículo'}
								</option>
								{availableVehicles.map((vehicle) => (
									<option key={vehicle.id} value={vehicle.id}>
										{formatVehicleOptionLabel(vehicle)}
									</option>
								))}
							</select>
							{!leadStoreId ? (
								<p className="text-xs text-[#6b7687]">
									Não foi possível determinar a loja do lead para filtrar os
									veículos.
								</p>
							) : null}
							{vehiclesQuery.isSuccess && availableVehicles.length === 0 ? (
								<p className="text-xs text-[#6b7687]">
									Nenhum veículo disponível para esta loja.
								</p>
							) : null}
							{vehiclesQuery.isError ? (
								<p className="text-xs text-destructive">
									{vehiclesQuery.error instanceof ApiError
										? vehiclesQuery.error.message
										: 'Não foi possível carregar veículos disponíveis.'}
								</p>
							) : null}
						</div>
						<div className="space-y-2">
							<Label htmlFor="lead-deal-title">Título</Label>
							<Input
								id="lead-deal-title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="lead-deal-value">Valor</Label>
							<Input
								id="lead-deal-value"
								inputMode="numeric"
								autoComplete="off"
								placeholder="R$ 0,00"
								value={formatCentsDigitsToBrlDisplay(valueCentsDigits)}
								onChange={(e) =>
									setValueCentsDigits(sanitizeMoneyDigitsInput(e.target.value))
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setCreateOpen(false)}
						>
							Cancelar
						</Button>
						<Button
							type="button"
							className="rounded-md bg-[#2D3648] hover:bg-[#232B3B]"
							disabled={
								!allowLeadMutations ||
								createMutation.isPending ||
								!vehicleId ||
								(vehiclesQuery.isSuccess && availableVehicles.length === 0)
							}
							onClick={() => void handleCreateSubmit()}
						>
							{createMutation.isPending ? 'Criando...' : 'Criar negociação'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<DealDetailsDialog
				deal={targetDeal}
				onClose={() => {
					setDetailsOpen(false);
					setTargetDeal(null);
				}}
				open={detailsOpen}
			/>

			<DealFormDialog
				isPending={updateMutation.isPending}
				onClose={() => {
					setEditOpen(false);
					setTargetDeal(null);
				}}
				onDelete={(deal) => {
					setEditOpen(false);
					openDelete(deal);
				}}
				onSubmit={async (values) => {
					if (!targetDeal) return;
					await updateMutation.mutateAsync({
						dealId: targetDeal.id,
						payload: values,
					});
				}}
				open={editOpen}
				targetDeal={targetDeal}
			/>

			<DealConfirmDialog
				confirmLabel="Confirmar exclusão"
				description={
					targetDeal
						? `A negociação «${targetDeal.title}» será removida permanentemente.`
						: 'Confirme a exclusão da negociação selecionada.'
				}
				error={dialogError}
				isPending={deleteMutation.isPending}
				onClose={() => {
					setDeleteOpen(false);
					setTargetDeal(null);
					setDialogError(null);
				}}
				onConfirm={handleDeleteConfirm}
				open={deleteOpen}
				title="Excluir negociação"
			/>
		</>
	);
}

export { LeadDealsDialog };
