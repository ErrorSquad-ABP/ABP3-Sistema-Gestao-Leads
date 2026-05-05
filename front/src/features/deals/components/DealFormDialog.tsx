'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	Activity,
	Car,
	Check,
	ChevronDown,
	CircleCheck,
	CircleX,
	FileText,
	Flame,
	Handshake,
	Info,
	ListChecks,
	MessageSquareText,
	PencilLine,
	PhoneCall,
	ScrollText,
	Search,
	Snowflake,
	SunMedium,
	Tag,
	Trophy,
	User,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
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
import { formatVehicleDealSelectLabel } from '@/features/vehicles/lib/vehicle-formatters';
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
import { DEAL_INVALID_STAGE_SKIP_USER_MESSAGE } from '../lib/deal-invalid-stage-transition-user-message';
import { dealDarkSidebarToast } from '../lib/deal-toast-style';
import type {
	Deal,
	DealImportance,
	DealStage,
	DealStatus,
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

const fieldShellClass =
	'relative flex h-10 items-center rounded-xl border border-[#d9dee7] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.025)] transition-colors focus-within:border-[#d76b34]/45';

const inputClass =
	'h-full rounded-xl border-0 bg-transparent px-3 text-[13px] shadow-none outline-none focus-visible:border-transparent focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-60';

const selectButtonClass =
	'flex h-full w-full items-center rounded-xl border-0 bg-transparent py-0 pl-14 pr-9 text-left text-[13px] text-[#1b2430] outline-none disabled:cursor-not-allowed disabled:opacity-60';

const searchableInputClass =
	'h-full w-full rounded-xl border-0 bg-transparent py-0 pl-10 pr-9 text-[13px] text-[#1b2430] shadow-none outline-none placeholder:text-[#9aa3b2] focus-visible:border-transparent focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-60';

const dropdownPanelClass =
	'absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-36 overflow-y-auto rounded-xl border border-[#e5e9f0] bg-white p-1 shadow-[0_12px_34px_rgba(15,23,42,0.12)]';

const dropdownItemClass =
	'w-full rounded-lg px-3 py-1.5 text-left text-[13px] text-[#1b2430] hover:bg-[color:var(--brand-accent-soft)]/35';

const DEAL_INVALID_STAGE_TRANSITION_CODE = 'deal.invalid_stage_transition';

function getFriendlyMessageForInvalidStageTransition(apiMessage: string) {
	if (/negociac[aã]o nova|nova deve iniciar/i.test(apiMessage)) {
		return 'Negociações novas começam na primeira etapa do funil. Ajuste a etapa e tente de novo.';
	}
	return DEAL_INVALID_STAGE_SKIP_USER_MESSAGE;
}

function normalizeSearch(value: string) {
	return value.trim().toLowerCase();
}

function getStageVisual(stage: DealStage | undefined) {
	switch (stage) {
		case 'INITIAL_CONTACT':
			return {
				Icon: User,
				wrapClassName:
					'bg-[color:var(--brand-accent-soft)]/45 text-[color:var(--brand-accent)]',
			};
		case 'NEGOTIATION':
			return {
				Icon: Handshake,
				wrapClassName: 'bg-sky-50 text-sky-600',
			};
		case 'PROPOSAL':
			return {
				Icon: ScrollText,
				wrapClassName: 'bg-violet-50 text-violet-600',
			};
		case 'CLOSING':
			return {
				Icon: MessageSquareText,
				wrapClassName: 'bg-amber-50 text-amber-600',
			};
		default:
			return {
				Icon: PhoneCall,
				wrapClassName: 'bg-slate-100 text-slate-500',
			};
	}
}

function getImportanceVisual(importance: DealImportance | undefined) {
	switch (importance) {
		case 'HOT':
			return {
				Icon: Flame,
				wrapClassName:
					'bg-[color:var(--brand-accent-soft)]/45 text-[color:var(--brand-accent)]',
			};
		case 'WARM':
			return {
				Icon: SunMedium,
				wrapClassName: 'bg-amber-50 text-amber-600',
			};
		case 'COLD':
			return {
				Icon: Snowflake,
				wrapClassName: 'bg-sky-50 text-sky-600',
			};
		default:
			return {
				Icon: Flame,
				wrapClassName: 'bg-slate-100 text-slate-500',
			};
	}
}

function getStatusVisual(status: DealStatus | undefined) {
	switch (status) {
		case 'OPEN':
			return {
				Icon: Activity,
				wrapClassName: 'bg-emerald-50 text-emerald-600',
			};
		case 'WON':
			return {
				Icon: CircleCheck,
				wrapClassName: 'bg-teal-50 text-teal-600',
			};
		case 'LOST':
			return {
				Icon: CircleX,
				wrapClassName: 'bg-rose-50 text-rose-600',
			};
		default:
			return {
				Icon: Activity,
				wrapClassName: 'bg-slate-100 text-slate-500',
			};
	}
}

function getSummaryStageTextClass(
	currentStage: DealStage | undefined,
	stage: DealStage,
) {
	if (currentStage !== stage) {
		return 'space-y-1 text-[10px] font-medium text-[#7a8494]';
	}
	switch (stage) {
		case 'INITIAL_CONTACT':
			return 'space-y-1 text-[10px] font-medium text-[color:var(--brand-accent)]';
		case 'NEGOTIATION':
			return 'space-y-1 text-[10px] font-medium text-sky-600';
		case 'PROPOSAL':
			return 'space-y-1 text-[10px] font-medium text-violet-600';
		case 'CLOSING':
			return 'space-y-1 text-[10px] font-medium text-amber-600';
	}
}

function getSummaryStageIconClass(
	currentStage: DealStage | undefined,
	stage: DealStage,
) {
	const base = 'mx-auto flex size-7 items-center justify-center rounded-full';
	if (currentStage !== stage) {
		return `${base} bg-[#f4f6f8]`;
	}
	return `${base} ${getStageVisual(stage).wrapClassName}`;
}

function getOptionLabel<T extends string>(
	options: { value: T; label: string }[],
	value: T | undefined,
) {
	return options.find((option) => option.value === value)?.label ?? 'Selecione';
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
	const [vehicleSearch, setVehicleSearch] = useState('');
	const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
	const [stageDropdownOpen, setStageDropdownOpen] = useState(false);
	const [importanceDropdownOpen, setImportanceDropdownOpen] = useState(false);
	const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
	const vehicleSearchRef = useRef<HTMLInputElement | null>(null);
	const isReadOnly = Boolean(targetDeal && targetDeal.status !== 'OPEN');

	const form = useForm<DealUpdateFormInput>({
		resolver: zodResolver(dealUpdateSchema),
		defaultValues: {},
	});

	const titleValue = useWatch({ control: form.control, name: 'title' });
	const stageValue = useWatch({ control: form.control, name: 'stage' });
	const importanceValue = useWatch({
		control: form.control,
		name: 'importance',
	});
	const statusValue = useWatch({ control: form.control, name: 'status' });
	const stageVisual = getStageVisual(stageValue);
	const importanceVisual = getImportanceVisual(importanceValue);
	const statusVisual = getStatusVisual(statusValue);

	const leadId = targetDeal?.leadId ?? '';
	const leadQuery = useLeadDetailQuery(leadId, {
		enabled: Boolean(open && leadId),
	});
	const leadStoreId = leadQuery.data?.storeId ?? null;

	const vehiclesQuery = useVehiclesListQuery(
		{
			status: 'AVAILABLE',
			withoutOpenDeal: true,
		},
		{ enabled: Boolean(open && leadStoreId && !isReadOnly) },
	);
	const availableVehicles = useMemo(
		() =>
			(vehiclesQuery.data ?? []).filter(
				(vehicle) => vehicle.storeId === leadStoreId,
			),
		[leadStoreId, vehiclesQuery.data],
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
			label: formatVehicleDealSelectLabel(v),
		}));

		if (!current) return fromAvailable;

		const hasCurrent = fromAvailable.some((v) => v.id === current.id);
		return hasCurrent ? fromAvailable : [current, ...fromAvailable];
	}, [availableVehicles, resolvedCurrentVehicle.displayLabel, targetDeal]);

	const filteredVehicleOptions = useMemo(() => {
		const search = normalizeSearch(vehicleSearch);
		if (!search) {
			return vehicleOptions;
		}
		return vehicleOptions.filter((vehicle) =>
			normalizeSearch(vehicle.label).includes(search),
		);
	}, [vehicleOptions, vehicleSearch]);

	useEffect(() => {
		if (!open) {
			queueMicrotask(() => {
				form.reset({});
				setValueCentsDigits('');
				setVehicleSearch('');
				setVehicleDropdownOpen(false);
				setStageDropdownOpen(false);
				setImportanceDropdownOpen(false);
				setStatusDropdownOpen(false);
			});
			return;
		}
		if (targetDeal) {
			queueMicrotask(() => {
				form.reset({
					title: targetDeal.title,
					vehicleId: targetDeal.vehicleId,
					stage: targetDeal.stage,
					importance: targetDeal.importance,
					status: targetDeal.status,
				});
				setValueCentsDigits(apiDecimalStringToCentsDigits(targetDeal.value));
				setVehicleSearch(resolvedCurrentVehicle.displayLabel);
				setVehicleDropdownOpen(false);
				setStageDropdownOpen(false);
				setImportanceDropdownOpen(false);
				setStatusDropdownOpen(false);
			});
		} else {
			queueMicrotask(() => {
				setValueCentsDigits('');
				setVehicleSearch('');
				setVehicleDropdownOpen(false);
				setStageDropdownOpen(false);
				setImportanceDropdownOpen(false);
				setStatusDropdownOpen(false);
			});
		}
	}, [form, open, resolvedCurrentVehicle.displayLabel, targetDeal]);

	function handleSelectVehicle(option: { id: string; label: string }) {
		form.setValue('vehicleId', option.id as DealUpdateFormInput['vehicleId'], {
			shouldDirty: true,
			shouldValidate: true,
		});
		setVehicleSearch(option.label);
		setVehicleDropdownOpen(false);

		const picked = availableVehicles.find((v) => v.id === option.id);
		if (picked) {
			setValueCentsDigits(apiDecimalStringToCentsDigits(picked.price));
		}
	}

	async function handleSubmit() {
		if (isReadOnly) {
			const message = 'Negociação finalizada. Não é possível editar os campos.';
			setSubmitError(message);
			toast.warning(message, {
				id: 'deal-edit-readonly',
				...dealDarkSidebarToast,
			});
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
			toast.success('Negociação alterada com sucesso.', {
				...dealDarkSidebarToast,
			});
			onClose();
		} catch (error) {
			const message = getDealsErrorMessage(error);
			setSubmitError(message);
			toast.error(message, {
				...dealDarkSidebarToast,
			});
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
			<DialogContent className="max-h-[min(92vh,840px)] max-w-4xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[18px] border-[#e7ebf0] p-0 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
				<DialogHeader className="flex-row items-start gap-4 px-8 py-6">
					<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-accent-soft)]/45 text-[color:var(--brand-accent)]">
						<PencilLine className="size-6" />
					</div>
					<div className="min-w-0 space-y-1">
						<p className="text-[0.68rem] font-bold uppercase tracking-[0.35em] text-[color:var(--brand-accent)]">
							Negociações
						</p>
						<DialogTitle className="text-[1.35rem] font-bold leading-tight tracking-[-0.02em] text-[#1b2430]">
							Editar negociação
						</DialogTitle>
						<DialogDescription className="max-w-2xl text-[13px] leading-5 text-[#7a8494]">
							Atualize os dados da negociação. O backend valida transições de
							etapa, disponibilidade do veículo e regras de negócio.
						</DialogDescription>
					</div>
				</DialogHeader>

				<form
					className="flex min-h-0 flex-1 flex-col overflow-hidden"
					onSubmit={form.handleSubmit(handleSubmit)}
				>
					<div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-8 py-5">
						{isReadOnly ? (
							<div className="rounded-xl border border-border/80 bg-muted/20 px-4 py-3 text-sm text-[#6b7687]">
								Negociação finalizada. Os dados abaixo estão disponíveis apenas
								para consulta.
							</div>
						) : null}
						{submitError ? (
							<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
								{submitError}
							</div>
						) : null}

						<div className="flex items-center justify-between gap-4 rounded-xl border border-[#edf1f6] bg-[#f8fafc] px-4 py-3 text-[#667085]">
							<div className="flex min-w-0 items-center gap-3">
								<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef6ff] text-[#2f80c9]">
									<Info className="size-5" />
								</span>
								<p className="text-[12.5px] leading-5">
									Ao alterar o veículo, as validações de disponibilidade serão
									aplicadas. O veículo atual será liberado automaticamente caso
									a troca seja realizada.
								</p>
							</div>
							<Button
								className="hidden h-9 shrink-0 rounded-xl bg-white px-4 text-[12px] font-semibold text-[#1b2430] shadow-[0_1px_4px_rgba(15,23,42,0.08)] hover:bg-white sm:inline-flex"
								disabled={isPending || isReadOnly}
								onClick={() => {
									vehicleSearchRef.current?.focus();
									setVehicleDropdownOpen(true);
								}}
								type="button"
								variant="outline"
							>
								<Car className="size-4" />
								Trocar veículo
							</Button>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-1 md:col-span-2">
								<Label
									className="text-[12.5px] font-semibold text-[#1b2430]"
									htmlFor="deal-form-title"
								>
									Título{' '}
									<span className="text-[color:var(--brand-accent)]">*</span>
								</Label>
								<div className={fieldShellClass}>
									<Tag className="pointer-events-none absolute left-3.5 size-4 text-[#4b5565]" />
									<Input
										className={`${inputClass} pl-10 uppercase tracking-[0.01em]`}
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
								<p className="text-[11.5px] leading-4 text-[#7a8494]">
									Dê um título claro para esta negociação.
								</p>
							</div>

							<div className="space-y-1">
								<Label
									className="text-[12.5px] font-semibold text-[#1b2430]"
									htmlFor="deal-form-value"
								>
									Valor{' '}
									<span className="text-[color:var(--brand-accent)]">*</span>
								</Label>
								<div className={fieldShellClass}>
									<span className="flex h-full w-10 shrink-0 items-center justify-center border-r border-[#e5e9f0] text-[13px] font-medium text-[#4b5565]">
										R$
									</span>
									<Input
										className={inputClass}
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
								<p className="text-[11.5px] leading-4 text-[#7a8494]">
									Informe o valor estimado da negociação.
								</p>
							</div>

							<div className="space-y-1">
								<Label
									className="text-[12.5px] font-semibold text-[#1b2430]"
									htmlFor="deal-form-vehicle"
								>
									Veículo{' '}
									<span className="text-[color:var(--brand-accent)]">*</span>
								</Label>
								<div className={fieldShellClass}>
									<Search className="pointer-events-none absolute left-3.5 size-4 text-[#4b5565]" />
									<input
										autoComplete="off"
										className={searchableInputClass}
										disabled={
											isPending ||
											isReadOnly ||
											!leadStoreId ||
											vehiclesQuery.isPending
										}
										id="deal-form-vehicle"
										onBlur={() => {
											window.setTimeout(
												() => setVehicleDropdownOpen(false),
												120,
											);
										}}
										onChange={(event) => {
											setVehicleSearch(event.target.value);
											form.setValue(
												'vehicleId',
												'' as DealUpdateFormInput['vehicleId'],
												{
													shouldDirty: true,
													shouldValidate: true,
												},
											);
											setVehicleDropdownOpen(true);
										}}
										onFocus={() => setVehicleDropdownOpen(true)}
										placeholder={
											vehiclesQuery.isPending
												? 'Carregando veículos disponíveis...'
												: 'Buscar veículo disponível...'
										}
										ref={vehicleSearchRef}
										value={vehicleSearch}
									/>
									<ChevronDown className="pointer-events-none absolute right-3.5 size-4 text-[#4b5565]" />
									{vehicleDropdownOpen &&
									!vehiclesQuery.isPending &&
									vehicleOptions.length > 0 ? (
										<div className={dropdownPanelClass}>
											{filteredVehicleOptions.length > 0 ? (
												filteredVehicleOptions.map((vehicle) => (
													<button
														key={vehicle.id}
														className={dropdownItemClass}
														onMouseDown={(event) => {
															event.preventDefault();
															handleSelectVehicle(vehicle);
														}}
														type="button"
													>
														{vehicle.label}
													</button>
												))
											) : (
												<p className="px-3 py-2 text-sm text-[#7a8494]">
													Nenhum veículo encontrado.
												</p>
											)}
										</div>
									) : null}
								</div>
								{!leadStoreId ? (
									<p className="text-[11.5px] leading-4 text-[#6b7687]">
										Não foi possível determinar a loja do lead.
									</p>
								) : vehiclesQuery.isPending ? (
									<p className="text-[11.5px] leading-4 text-[#6b7687]">
										Carregando veículos disponíveis...
									</p>
								) : vehiclesQuery.isSuccess && vehicleOptions.length <= 1 ? (
									<p className="text-[11.5px] leading-4 text-[#6b7687]">
										Nenhum outro veículo livre para negociação na loja deste
										lead.
									</p>
								) : form.formState.errors.vehicleId ? (
									<p className="text-[11.5px] leading-4 text-destructive">
										{String(form.formState.errors.vehicleId.message)}
									</p>
								) : (
									<p className="text-[11.5px] leading-4 text-[#7a8494]">
										Apenas veículos disponíveis e sem negociação aberta podem
										ser selecionados.
									</p>
								)}
							</div>

							<div className="space-y-1">
								<Label
									className="text-[12.5px] font-semibold text-[#1b2430]"
									htmlFor="deal-form-stage"
								>
									Etapa{' '}
									<span className="text-[color:var(--brand-accent)]">*</span>
								</Label>
								<div className={fieldShellClass}>
									<span
										className={`pointer-events-none absolute left-3.5 flex size-7 items-center justify-center rounded-full ${stageVisual.wrapClassName}`}
									>
										<stageVisual.Icon className="size-4" />
									</span>
									<button
										className={selectButtonClass}
										disabled={isPending || isReadOnly}
										id="deal-form-stage"
										onBlur={() => {
											window.setTimeout(() => setStageDropdownOpen(false), 120);
										}}
										onClick={() => setStageDropdownOpen((current) => !current)}
										type="button"
									>
										<span className="truncate">
											{getOptionLabel(dealStageOptions, stageValue)}
										</span>
									</button>
									<ChevronDown className="pointer-events-none absolute right-3.5 size-4 text-[#4b5565]" />
									{stageDropdownOpen ? (
										<div className={dropdownPanelClass}>
											{dealStageOptions.map((opt) => (
												<button
													key={opt.value}
													className={dropdownItemClass}
													onMouseDown={(event) => {
														event.preventDefault();
														form.setValue('stage', opt.value, {
															shouldDirty: true,
															shouldValidate: true,
														});
														setStageDropdownOpen(false);
													}}
													type="button"
												>
													{opt.label}
												</button>
											))}
										</div>
									) : null}
								</div>
								<p className="text-[11.5px] leading-4 text-[#7a8494]">
									A etapa define o momento atual da negociação.
								</p>
							</div>

							<div className="space-y-1">
								<Label
									className="text-[12.5px] font-semibold text-[#1b2430]"
									htmlFor="deal-form-importance"
								>
									Importância{' '}
									<span className="text-[color:var(--brand-accent)]">*</span>
								</Label>
								<div className={fieldShellClass}>
									<span
										className={`pointer-events-none absolute left-3.5 flex size-7 items-center justify-center rounded-full ${importanceVisual.wrapClassName}`}
									>
										<importanceVisual.Icon className="size-4" />
									</span>
									<button
										className={selectButtonClass}
										disabled={isPending || isReadOnly}
										id="deal-form-importance"
										onBlur={() => {
											window.setTimeout(
												() => setImportanceDropdownOpen(false),
												120,
											);
										}}
										onClick={() =>
											setImportanceDropdownOpen((current) => !current)
										}
										type="button"
									>
										<span className="truncate">
											{getOptionLabel(dealImportanceOptions, importanceValue)}
										</span>
									</button>
									<ChevronDown className="pointer-events-none absolute right-3.5 size-4 text-[#4b5565]" />
									{importanceDropdownOpen ? (
										<div className={dropdownPanelClass}>
											{dealImportanceOptions.map((opt) => (
												<button
													key={opt.value}
													className={dropdownItemClass}
													onMouseDown={(event) => {
														event.preventDefault();
														form.setValue('importance', opt.value, {
															shouldDirty: true,
															shouldValidate: true,
														});
														setImportanceDropdownOpen(false);
													}}
													type="button"
												>
													{opt.label}
												</button>
											))}
										</div>
									) : null}
								</div>
								<p className="text-[11.5px] leading-4 text-[#7a8494]">
									A importância ajuda a priorizar seus esforços.
								</p>
							</div>

							<div className="space-y-1">
								<Label
									className="text-[12.5px] font-semibold text-[#1b2430]"
									htmlFor="deal-form-status"
								>
									Status{' '}
									<span className="text-[color:var(--brand-accent)]">*</span>
								</Label>
								<div className={fieldShellClass}>
									<span
										className={`pointer-events-none absolute left-3.5 flex size-7 items-center justify-center rounded-full ${statusVisual.wrapClassName}`}
									>
										<statusVisual.Icon className="size-4" />
									</span>
									<button
										className={selectButtonClass}
										disabled={isPending || isReadOnly}
										id="deal-form-status"
										onBlur={() => {
											window.setTimeout(
												() => setStatusDropdownOpen(false),
												120,
											);
										}}
										onClick={() => setStatusDropdownOpen((current) => !current)}
										type="button"
									>
										<span className="truncate">
											{getOptionLabel(dealStatusOptions, statusValue)}
										</span>
									</button>
									<ChevronDown className="pointer-events-none absolute right-3.5 size-4 text-[#4b5565]" />
									{statusDropdownOpen ? (
										<div className={dropdownPanelClass}>
											{dealStatusOptions.map((opt) => (
												<button
													key={opt.value}
													className={dropdownItemClass}
													onMouseDown={(event) => {
														event.preventDefault();
														form.setValue('status', opt.value, {
															shouldDirty: true,
															shouldValidate: true,
														});
														setStatusDropdownOpen(false);
													}}
													type="button"
												>
													{opt.label}
												</button>
											))}
										</div>
									) : null}
								</div>
								<p className="text-[11.5px] leading-4 text-[#7a8494]">
									A negociação só pode ser editada quando está em aberto.
								</p>
							</div>
						</div>
						<div className="flex items-center justify-between gap-4 rounded-xl border border-[#e7ebf0] bg-white px-4 py-4">
							<div className="flex min-w-0 items-center gap-3">
								<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-accent-soft)]/45 text-[color:var(--brand-accent)]">
									<ListChecks className="size-4" />
								</span>
								<div className="min-w-0">
									<p className="text-sm font-bold text-[#1b2430]">
										Resumo da negociação
									</p>
									<p className="text-[12px] text-[#7a8494]">
										Confira os dados atuais antes de salvar as alterações.
									</p>
								</div>
							</div>
							<div className="hidden shrink-0 items-center gap-2 text-center sm:flex">
								<div
									className={getSummaryStageTextClass(
										stageValue,
										'INITIAL_CONTACT',
									)}
								>
									<span
										className={getSummaryStageIconClass(
											stageValue,
											'INITIAL_CONTACT',
										)}
									>
										<User className="size-3.5" />
									</span>
									<p>Contato inicial</p>
								</div>
								<span className="h-px w-5 bg-[#e5e9f0]" />
								<div
									className={getSummaryStageTextClass(
										stageValue,
										'NEGOTIATION',
									)}
								>
									<span
										className={getSummaryStageIconClass(
											stageValue,
											'NEGOTIATION',
										)}
									>
										<Handshake className="size-3.5" />
									</span>
									<p>Negociação</p>
								</div>
								<span className="h-px w-5 bg-[#e5e9f0]" />
								<div
									className={getSummaryStageTextClass(stageValue, 'PROPOSAL')}
								>
									<span
										className={getSummaryStageIconClass(stageValue, 'PROPOSAL')}
									>
										<FileText className="size-3.5" />
									</span>
									<p>Proposta</p>
								</div>
								<span className="h-px w-5 bg-[#e5e9f0]" />
								<div
									className={getSummaryStageTextClass(stageValue, 'CLOSING')}
								>
									<span
										className={getSummaryStageIconClass(stageValue, 'CLOSING')}
									>
										<Trophy className="size-3.5" />
									</span>
									<p>Fechamento</p>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter className="shrink-0 px-8 py-4">
						<Button
							className="h-10 rounded-xl px-5 font-semibold shadow-none"
							onClick={onClose}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button
							className="h-10 rounded-xl bg-[#101a33] px-5 font-semibold text-white shadow-none hover:bg-[#17223d]"
							disabled={isPending || isReadOnly}
							type="submit"
						>
							<Check className="size-4" />
							{isPending ? 'Salvando...' : 'Salvar alterações'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export { DealFormDialog, getDealsErrorMessage };
