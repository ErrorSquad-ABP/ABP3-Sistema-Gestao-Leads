'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PencilLine } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ZodError } from 'zod';

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
import { useLeadDetailQuery } from '@/features/leads/hooks/leads.queries';
import { useVehiclesListQuery } from '@/features/vehicles/hooks/vehicles.queries';
import type { Vehicle } from '@/features/vehicles/model/vehicles.model';
import { isApiError } from '@/lib/http/api-error';
import {
	dealImportanceOptions,
	dealStageOptions,
	dealStatusOptions,
} from '../lib/deal-labels';
import { useResolvedVehicleLabel } from '../hooks/use-resolved-vehicle-label';
import {
	apiDecimalStringToCentsDigits,
	centsDigitsToApiDecimalString,
	formatCentsDigitsToBrlDisplay,
	sanitizeMoneyDigitsInput,
} from '../lib/deal-money-input';
import type {
	Deal,
	DealUpdateFormInput,
	DealUpdateInput,
} from '../model/deals.model';
import { dealUpdateSchema } from '../schemas/deal-management.schema';

type DealFormDialogProps = {
	isPending: boolean;
	onClose: () => void;
	onSubmit: (values: DealUpdateInput) => Promise<void>;
	open: boolean;
	targetDeal: Deal | null;
};

const selectClass =
	'flex h-11 w-full rounded-xl border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45';

const DEAL_INVALID_STAGE_TRANSITION_CODE = 'deal.invalid_stage_transition';

function getFriendlyMessageForInvalidStageTransition(apiMessage: string) {
	if (/negociac[aã]o nova|nova deve iniciar/i.test(apiMessage)) {
		return 'Negociações novas começam na primeira etapa do funil. Ajuste a etapa e tente de novo.';
	}
	return 'Não é possível pular etapas. Avance ou volte somente uma etapa por vez no funil.';
}

function formatVehicleOptionLabel(vehicle: Vehicle) {
	const plate = vehicle.plate ? vehicle.plate.trim() : '';
	return `${vehicle.brand} ${vehicle.model} ${vehicle.modelYear} · ${plate || 'Sem placa'}`;
}

function getDealsErrorMessage(error: unknown) {
	if (error instanceof ZodError) {
		return error.issues[0]?.message ?? 'Dados inválidos. Revise o formulário.';
	}
	if (!isApiError(error)) {
		return 'Não foi possível concluir a operação agora. Tente novamente em instantes.';
	}
	if (error.code === DEAL_INVALID_STAGE_TRANSITION_CODE) {
		return getFriendlyMessageForInvalidStageTransition(error.message);
	}
	if (
		error.status === 400 &&
		error.errors.some((e) => e.code === DEAL_INVALID_STAGE_TRANSITION_CODE)
	) {
		const raw =
			error.errors.find((e) => e.code === DEAL_INVALID_STAGE_TRANSITION_CODE)
				?.message ?? error.message;
		return getFriendlyMessageForInvalidStageTransition(raw);
	}
	if (error.status === 400) {
		return error.message || 'Os dados não passaram na validação da API.';
	}
	if (error.status === 403) {
		return (
			error.message || 'O seu perfil não tem permissão para esta operação.'
		);
	}
	if (error.status === 404) {
		return error.message || 'A negociação selecionada não foi encontrada.';
	}
	return error.message;
}

function DealFormDialog({
	isPending,
	onClose,
	onSubmit,
	open,
	targetDeal,
}: DealFormDialogProps) {
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [valueCentsDigits, setValueCentsDigits] = useState('');
	const isReadOnly = Boolean(targetDeal && targetDeal.status !== 'OPEN');

	const form = useForm<DealUpdateFormInput>({
		resolver: zodResolver(dealUpdateSchema),
		defaultValues: {},
	});

	const titleValue = useWatch({ control: form.control, name: 'title' });
	const vehicleValue = useWatch({ control: form.control, name: 'vehicleId' });
	const stageValue = useWatch({ control: form.control, name: 'stage' });
	const importanceValue = useWatch({
		control: form.control,
		name: 'importance',
	});
	const statusValue = useWatch({ control: form.control, name: 'status' });

	const leadId = targetDeal?.leadId ?? '';
	const leadQuery = useLeadDetailQuery(leadId, {
		enabled: Boolean(open && leadId),
	});
	const leadStoreId = leadQuery.data?.storeId ?? null;

	const vehiclesQuery = useVehiclesListQuery(
		{
			status: 'AVAILABLE',
			storeId: leadStoreId ?? undefined,
		},
		{ enabled: Boolean(open && leadStoreId && !isReadOnly) },
	);
	const availableVehicles = useMemo(
		() => vehiclesQuery.data ?? [],
		[vehiclesQuery.data],
	);

	const resolvedCurrentVehicle = useResolvedVehicleLabel(
		targetDeal?.vehicleId ?? '',
		targetDeal?.vehicleLabel,
	);

	const vehicleOptions = useMemo(() => {
		const current = targetDeal
			? ({
					id: targetDeal.vehicleId,
					label: resolvedCurrentVehicle.displayLabel,
				} as const)
			: null;

		const fromAvailable = availableVehicles.map((v) => ({
			id: v.id,
			label: formatVehicleOptionLabel(v),
		}));

		if (!current) return fromAvailable;

		const hasCurrent = fromAvailable.some((v) => v.id === current.id);
		return hasCurrent ? fromAvailable : [current, ...fromAvailable];
	}, [availableVehicles, resolvedCurrentVehicle.displayLabel, targetDeal]);

	useEffect(() => {
		if (!open) {
			form.reset({});
			setValueCentsDigits('');
			return;
		}
		if (targetDeal) {
			form.reset({
				title: targetDeal.title,
				vehicleId: targetDeal.vehicleId,
				stage: targetDeal.stage,
				importance: targetDeal.importance,
				status: targetDeal.status,
			});
			setValueCentsDigits(apiDecimalStringToCentsDigits(targetDeal.value));
		} else {
			setValueCentsDigits('');
		}
	}, [form, open, targetDeal]);

	async function handleSubmit(_values: DealUpdateFormInput) {
		if (isReadOnly) {
			setSubmitError('Negociação finalizada. Não é possível editar os campos.');
			return;
		}
		setSubmitError(null);
		try {
			const base = form.getValues();
			const valueAsApi = centsDigitsToApiDecimalString(valueCentsDigits);
			const parsed = dealUpdateSchema.parse({
				...base,
				value: valueAsApi,
			} satisfies DealUpdateFormInput);
			await onSubmit(parsed as DealUpdateInput);
			onClose();
		} catch (error) {
			setSubmitError(getDealsErrorMessage(error));
		}
	}

	return (
		<Dialog
			onOpenChange={(nextOpen) => {
				if (nextOpen) return;
				setSubmitError(null);
				onClose();
			}}
			open={open}
		>
			<DialogContent className="flex max-h-[84vh] max-w-4xl flex-col overflow-hidden rounded-[1.75rem] border border-[#d8e0ea] bg-white">
				<DialogHeader className="gap-3 border-b border-[#e5ebf3] px-8 py-7">
					<div className="flex items-center gap-4">
						<div className="flex size-13 items-center justify-center rounded-2xl border border-[#d96c3f]/15 bg-[#d96c3f]/10 text-[#d96c3f]">
							<PencilLine className="size-6" />
						</div>
						<div className="space-y-1">
							<p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#d96c3f]">
								Negociações
							</p>
							<DialogTitle>Editar negociação</DialogTitle>
							<DialogDescription className="max-w-2xl">
								Ajuste veículo, etapa, importância, status e valor. O backend
								valida transições e disponibilidade.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<form
					className="flex min-h-0 flex-1 flex-col overflow-hidden"
					onSubmit={form.handleSubmit(handleSubmit)}
				>
					<div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-8 pb-8 pt-7">
						{isReadOnly ? (
							<div className="rounded-2xl border border-border/80 bg-muted/20 px-4 py-3 text-sm text-[#6b7687]">
								Negociação finalizada. Os dados abaixo estão disponíveis apenas
								para consulta.
							</div>
						) : null}
						{submitError ? (
							<div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
								{submitError}
							</div>
						) : null}

						<div className="rounded-3xl border border-[#e5ebf3] bg-white p-5">
							<div className="grid gap-5 md:grid-cols-2">
								<div className="space-y-2 md:col-span-2">
									<Label htmlFor="deal-form-title">Título</Label>
									<Input
										className="h-11 rounded-xl border-[#d6dce5] bg-white shadow-none focus-visible:border-[#2d3648]/45"
										disabled={isPending || isReadOnly}
										id="deal-form-title"
										onChange={(event) =>
											form.setValue('title', event.target.value, {
												shouldDirty: true,
												shouldValidate: true,
											})
										}
										value={titleValue ?? ''}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="deal-form-value">Valor</Label>
									<Input
										className="h-11 rounded-xl border-[#d6dce5] bg-white shadow-none focus-visible:border-[#2d3648]/45"
										disabled={isPending || isReadOnly}
										id="deal-form-value"
										inputMode="numeric"
										autoComplete="off"
										onChange={(event) =>
											setValueCentsDigits(
												sanitizeMoneyDigitsInput(event.target.value),
											)
										}
										placeholder="R$ 0,00"
										value={formatCentsDigitsToBrlDisplay(valueCentsDigits)}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="deal-form-vehicle">Veículo</Label>
									<select
										className={selectClass}
										disabled={
											isPending ||
											isReadOnly ||
											!leadStoreId ||
											vehiclesQuery.isPending
										}
										id="deal-form-vehicle"
										onChange={(event) =>
											form.setValue(
												'vehicleId',
												event.target.value as DealUpdateFormInput['vehicleId'],
												{ shouldDirty: true, shouldValidate: true },
											)
										}
										value={vehicleValue ?? ''}
									>
										{vehicleOptions.map((opt) => (
											<option key={opt.id} value={opt.id}>
												{opt.label}
											</option>
										))}
									</select>
									{!leadStoreId ? (
										<p className="text-xs text-[#6b7687]">
											Não foi possível determinar a loja do lead para filtrar os
											veículos.
										</p>
									) : null}
									{vehiclesQuery.isPending ? (
										<p className="text-xs text-[#6b7687]">
											Carregando veículos disponíveis...
										</p>
									) : null}
									{form.formState.errors.vehicleId ? (
										<p className="text-xs text-destructive">
											{String(form.formState.errors.vehicleId.message)}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="deal-form-stage">Etapa</Label>
									<select
										className={selectClass}
										disabled={isPending || isReadOnly}
										id="deal-form-stage"
										onChange={(event) =>
											form.setValue(
												'stage',
												event.target.value as DealUpdateFormInput['stage'],
												{ shouldDirty: true, shouldValidate: true },
											)
										}
										value={stageValue ?? ''}
									>
										{dealStageOptions.map((opt) => (
											<option key={opt.value} value={opt.value}>
												{opt.label}
											</option>
										))}
									</select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="deal-form-importance">Importância</Label>
									<select
										className={selectClass}
										disabled={isPending || isReadOnly}
										id="deal-form-importance"
										onChange={(event) =>
											form.setValue(
												'importance',
												event.target.value as DealUpdateFormInput['importance'],
												{ shouldDirty: true, shouldValidate: true },
											)
										}
										value={importanceValue ?? ''}
									>
										{dealImportanceOptions.map((opt) => (
											<option key={opt.value} value={opt.value}>
												{opt.label}
											</option>
										))}
									</select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="deal-form-status">Status</Label>
									<select
										className={selectClass}
										disabled={isPending || isReadOnly}
										id="deal-form-status"
										onChange={(event) =>
											form.setValue(
												'status',
												event.target.value as DealUpdateFormInput['status'],
												{ shouldDirty: true, shouldValidate: true },
											)
										}
										value={statusValue ?? ''}
									>
										{dealStatusOptions.map((opt) => (
											<option key={opt.value} value={opt.value}>
												{opt.label}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter className="shrink-0 px-8 pb-6 pt-4">
						<Button
							className="rounded-md"
							onClick={onClose}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button
							className="rounded-md bg-[#2D3648] hover:bg-[#232B3B]"
							disabled={isPending || isReadOnly}
							type="submit"
						>
							{isPending ? 'Salvando...' : 'Salvar alterações'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export { DealFormDialog, getDealsErrorMessage };
