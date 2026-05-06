'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	Archive,
	BadgeDollarSign,
	Barcode,
	CalendarDays,
	CarFront,
	Droplet,
	Fuel,
	Gauge,
	IdCard,
	LockKeyhole,
	Save,
	ShieldCheck,
	Store,
	Tag,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isApiError } from '@/lib/http/api-error';

import {
	apiDecimalStringToCentsDigits,
	centsDigitsToApiDecimalString,
	formatCentsDigitsToBrlDisplay,
	sanitizeMoneyDigitsInput,
} from '@/features/deals/lib/deal-money-input';
import {
	digitsOnly,
	formatFiniteIntForInput,
	parseIntStrict,
} from '../lib/vehicle-form-input-helpers';
import {
	supportedFuelTypeOptions,
	vehicleStatusOptions,
} from '../lib/vehicle-labels';
import { vehicleFormSchema } from '../schemas/vehicle-management.schema';
import type {
	Vehicle,
	VehicleFormInput,
	VehicleFormOutput,
} from '../model/vehicles.model';
import {
	VehicleModalHeader,
	VehicleModalInfoBanner,
	VehicleModalSection,
	VehicleStatusSummary,
	vehicleModalContentClass,
} from './VehicleModalLayout';

type VehicleFormDialogProps = {
	isPending: boolean;
	mode: 'create' | 'edit';
	onClose: () => void;
	onRequestDeactivate?: (vehicle: Vehicle) => void;
	onSubmit: (values: VehicleFormOutput) => Promise<void>;
	open: boolean;
	stores: { id: string; name: string }[];
	targetVehicle: Vehicle | null;
};

const vehicleFormSelectClass =
	'flex h-11 w-full rounded-xl border border-[#cfd8e6] bg-white px-10 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45';

const vehicleFormInputClass =
	'h-11 rounded-xl border-[#cfd8e6] bg-white pl-10 text-[#1b2430] shadow-none focus-visible:border-[#2d3648]/45 focus-visible:ring-2 focus-visible:ring-[#d9e2ef]';

type VehicleFieldControlProps = {
	children: ReactNode;
	icon: ComponentType<{ className?: string }>;
	rightIcon?: ComponentType<{ className?: string }>;
};

function VehicleFieldControl({
	children,
	icon: Icon,
	rightIcon: RightIcon,
}: VehicleFieldControlProps) {
	return (
		<div className="relative">
			<Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6b7687]" />
			{children}
			{RightIcon ? (
				<RightIcon className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6b7687]" />
			) : null}
		</div>
	);
}

function getVehiclesErrorMessage(error: unknown) {
	if (!isApiError(error)) {
		return 'Não foi possível concluir a operação agora. Tente novamente em instantes.';
	}

	if (error.status === 400) {
		return (
			error.message || 'Os dados do veículo não passaram na validação da API.'
		);
	}

	if (error.status === 403) {
		return (
			error.message || 'O seu perfil não tem permissão para esta operação.'
		);
	}

	if (error.status === 404) {
		return error.message || 'O veículo selecionado não foi encontrado.';
	}

	return error.message;
}

function VehicleFormDialog({
	isPending,
	mode,
	onClose,
	onRequestDeactivate,
	onSubmit,
	open,
	stores,
	targetVehicle,
}: VehicleFormDialogProps) {
	const isEditMode = mode === 'edit';
	const [submitError, setSubmitError] = useState<string | null>(null);
	/** Dígitos de centavos; mesmo padrão de “Nova negociação” (BRL com máscara). */
	const [priceCentsDigits, setPriceCentsDigits] = useState('');
	const form = useForm<VehicleFormInput>({
		resolver: zodResolver(vehicleFormSchema),
		defaultValues: {
			storeId: '',
			brand: '',
			model: '',
			version: null,
			modelYear: new Date().getFullYear(),
			manufactureYear: null,
			color: null,
			mileage: 0,
			supportedFuelType: 'FLEX',
			price: '0.00',
			status: 'AVAILABLE',
			plate: null,
			vin: null,
		},
	});

	const selectedStoreId = useWatch({ control: form.control, name: 'storeId' });
	const brandValue = useWatch({ control: form.control, name: 'brand' });
	const modelValue = useWatch({ control: form.control, name: 'model' });
	const versionValue = useWatch({ control: form.control, name: 'version' });
	const colorValue = useWatch({ control: form.control, name: 'color' });
	const modelYearValue = useWatch({ control: form.control, name: 'modelYear' });
	const manufactureYearValue = useWatch({
		control: form.control,
		name: 'manufactureYear',
	});
	const mileageValue = useWatch({ control: form.control, name: 'mileage' });
	const plateValue = useWatch({ control: form.control, name: 'plate' });
	const vinValue = useWatch({ control: form.control, name: 'vin' });
	const fuelValue = useWatch({
		control: form.control,
		name: 'supportedFuelType',
	});
	const statusValue = useWatch({ control: form.control, name: 'status' });

	useEffect(() => {
		if (!open) {
			queueMicrotask(() => {
				setPriceCentsDigits('');
				form.reset();
			});
			return;
		}

		if (isEditMode && targetVehicle) {
			const priceAsApi = targetVehicle.price;
			queueMicrotask(() => {
				setPriceCentsDigits(apiDecimalStringToCentsDigits(priceAsApi));
				form.reset({
					storeId: targetVehicle.storeId,
					brand: targetVehicle.brand,
					model: targetVehicle.model,
					version: targetVehicle.version,
					modelYear: targetVehicle.modelYear,
					manufactureYear: targetVehicle.manufactureYear,
					color: targetVehicle.color,
					mileage: targetVehicle.mileage,
					supportedFuelType: targetVehicle.supportedFuelType,
					price: priceAsApi,
					status: targetVehicle.status,
					plate: targetVehicle.plate,
					vin: targetVehicle.vin,
				});
			});
			return;
		}

		queueMicrotask(() => {
			setPriceCentsDigits('0');
			form.reset({
				storeId: stores[0]?.id ?? '',
				brand: '',
				model: '',
				version: null,
				modelYear: new Date().getFullYear(),
				manufactureYear: null,
				color: null,
				mileage: 0,
				supportedFuelType: 'FLEX',
				price: '0.00',
				status: 'AVAILABLE',
				plate: null,
				vin: null,
			});
		});
	}, [form, isEditMode, open, stores, targetVehicle]);

	useEffect(() => {
		if (!open || isEditMode) {
			return;
		}

		const storeIds = new Set(stores.map((store) => store.id));
		const currentStoreId = form.getValues('storeId');
		if (!currentStoreId || !storeIds.has(currentStoreId)) {
			const nextStoreId = stores[0]?.id ?? '';
			if (nextStoreId) {
				form.setValue('storeId', nextStoreId, { shouldValidate: true });
			}
		}
	}, [open, isEditMode, stores, form]);

	const storeLabelById = useMemo(
		() => Object.fromEntries(stores.map((store) => [store.id, store.name])),
		[stores],
	);

	async function handleSubmit(values: VehicleFormInput) {
		setSubmitError(null);
		try {
			const parsed = vehicleFormSchema.parse(values);
			await onSubmit(parsed);
			onClose();
		} catch (error) {
			setSubmitError(getVehiclesErrorMessage(error));
		}
	}

	return (
		<Dialog
			onOpenChange={(nextOpen) => {
				if (nextOpen) {
					return;
				}
				setSubmitError(null);
				onClose();
			}}
			open={open}
		>
			<DialogContent className={vehicleModalContentClass}>
				<VehicleModalHeader
					description={
						isEditMode
							? 'Atualize os dados do veículo mantendo a consistência do catálogo operacional.'
							: 'Cadastre um veículo no catálogo, associando loja, dados operacionais e documentação.'
					}
					icon={CarFront}
					title={isEditMode ? 'Editar veículo' : 'Novo veículo'}
				/>

				<form
					className="flex min-h-0 flex-1 flex-col overflow-hidden"
					onSubmit={form.handleSubmit((values) => handleSubmit(values))}
				>
					<div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-7 pb-6 pt-3 md:px-8">
						{submitError ? (
							<div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
								{submitError}
							</div>
						) : null}

						<VehicleModalInfoBanner actionLabel="Ver regras">
							{isEditMode
								? 'A loja é fixa após o cadastro e não pode ser alterada nesta tela.'
								: 'A loja define o catálogo operacional e o status inicial do veículo.'}
						</VehicleModalInfoBanner>

						<VehicleModalSection
							description={
								isEditMode
									? 'A loja é fixa após o cadastro e não pode ser alterada.'
									: 'Selecione a loja onde o veículo será disponibilizado.'
							}
							title="Loja"
						>
							<div className="mt-4 space-y-2">
								{isEditMode ? (
									<div
										className="relative flex h-11 w-full items-center rounded-xl border border-[#cfd8e6] bg-[#f7f9fc] px-10 text-sm text-[#1b2430]"
										id="vehicle-form-store-readonly"
									>
										<Store className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6b7687]" />
										{storeLabelById[
											targetVehicle?.storeId ?? selectedStoreId
										] ??
											targetVehicle?.storeId ??
											selectedStoreId}
										<LockKeyhole className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6b7687]" />
									</div>
								) : (
									<VehicleFieldControl icon={Store}>
										<select
											className={vehicleFormSelectClass}
											id="vehicle-form-store"
											onChange={(event) =>
												form.setValue('storeId', event.target.value, {
													shouldDirty: true,
													shouldValidate: true,
												})
											}
											value={selectedStoreId}
										>
											<option value="" disabled>
												Selecione uma loja
											</option>
											{stores.map((store) => (
												<option key={store.id} value={store.id}>
													{store.name}
												</option>
											))}
										</select>
									</VehicleFieldControl>
								)}
								{form.formState.errors.storeId ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.storeId.message}
									</p>
								) : null}
							</div>
						</VehicleModalSection>

						<VehicleModalSection
							description="Preencha as informações do veículo com atenção."
							title="Dados do veículo"
						>
							<div className="grid gap-5 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="vehicle-form-brand">Marca</Label>
									<VehicleFieldControl icon={Tag}>
										<Input
											className={vehicleFormInputClass}
											id="vehicle-form-brand"
											onChange={(event) =>
												form.setValue('brand', event.target.value, {
													shouldDirty: true,
													shouldValidate: true,
												})
											}
											value={brandValue ?? ''}
										/>
									</VehicleFieldControl>
									{form.formState.errors.brand ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.brand.message}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-model">Modelo</Label>
									<VehicleFieldControl icon={CarFront}>
										<Input
											className={vehicleFormInputClass}
											id="vehicle-form-model"
											onChange={(event) =>
												form.setValue('model', event.target.value, {
													shouldDirty: true,
													shouldValidate: true,
												})
											}
											value={modelValue ?? ''}
										/>
									</VehicleFieldControl>
									{form.formState.errors.model ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.model.message}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-version">Versão</Label>
									<VehicleFieldControl icon={BadgeDollarSign}>
										<Input
											className={vehicleFormInputClass}
											id="vehicle-form-version"
											onChange={(event) =>
												form.setValue('version', event.target.value, {
													shouldDirty: true,
													shouldValidate: true,
												})
											}
											placeholder="Opcional"
											value={versionValue ?? ''}
										/>
									</VehicleFieldControl>
									{form.formState.errors.version ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.version.message as string}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-color">Cor</Label>
									<VehicleFieldControl icon={Droplet}>
										<Input
											className={vehicleFormInputClass}
											id="vehicle-form-color"
											onChange={(event) =>
												form.setValue('color', event.target.value, {
													shouldDirty: true,
													shouldValidate: true,
												})
											}
											placeholder="Opcional"
											value={colorValue ?? ''}
										/>
									</VehicleFieldControl>
									{form.formState.errors.color ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.color.message as string}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-model-year">Ano do modelo</Label>
									<VehicleFieldControl icon={CalendarDays}>
										<Input
											autoComplete="off"
											className={vehicleFormInputClass}
											id="vehicle-form-model-year"
											inputMode="numeric"
											onChange={(event) => {
												const d = digitsOnly(event.target.value, 4);
												if (d.length === 0) {
													return;
												}
												const n = parseIntStrict(d);
												if (n === null) {
													return;
												}
												form.setValue('modelYear', n, {
													shouldDirty: true,
													shouldValidate: true,
												});
											}}
											value={formatFiniteIntForInput(modelYearValue)}
										/>
									</VehicleFieldControl>
									{form.formState.errors.modelYear ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.modelYear.message}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-manufacture-year">
										Ano de fabricação
									</Label>
									<VehicleFieldControl icon={CalendarDays}>
										<Input
											autoComplete="off"
											className={vehicleFormInputClass}
											id="vehicle-form-manufacture-year"
											inputMode="numeric"
											onChange={(event) => {
												const d = digitsOnly(event.target.value, 4);
												if (d.length === 0) {
													form.setValue('manufactureYear', null, {
														shouldDirty: true,
														shouldValidate: true,
													});
													return;
												}
												const n = parseIntStrict(d);
												if (n === null) {
													return;
												}
												form.setValue('manufactureYear', n, {
													shouldDirty: true,
													shouldValidate: true,
												});
											}}
											placeholder="Opcional"
											value={formatFiniteIntForInput(
												manufactureYearValue ?? undefined,
											)}
										/>
									</VehicleFieldControl>
									{form.formState.errors.manufactureYear ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.manufactureYear.message as string}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-mileage">Quilometragem</Label>
									<VehicleFieldControl icon={Gauge}>
										<Input
											autoComplete="off"
											className={vehicleFormInputClass}
											id="vehicle-form-mileage"
											inputMode="numeric"
											onChange={(event) => {
												const d = digitsOnly(event.target.value, 9);
												if (d.length === 0) {
													form.setValue('mileage', 0, {
														shouldDirty: true,
														shouldValidate: true,
													});
													return;
												}
												const n = parseIntStrict(d);
												if (n === null) {
													return;
												}
												form.setValue('mileage', n, {
													shouldDirty: true,
													shouldValidate: true,
												});
											}}
											value={formatFiniteIntForInput(mileageValue)}
										/>
									</VehicleFieldControl>
									{form.formState.errors.mileage ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.mileage.message}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-fuel">Combustível</Label>
									<VehicleFieldControl icon={Fuel}>
										<select
											className={vehicleFormSelectClass}
											id="vehicle-form-fuel"
											onChange={(event) =>
												form.setValue(
													'supportedFuelType',
													event.target
														.value as VehicleFormInput['supportedFuelType'],
													{
														shouldDirty: true,
														shouldValidate: true,
													},
												)
											}
											value={fuelValue}
										>
											{supportedFuelTypeOptions.map((fuel) => (
												<option key={fuel.value} value={fuel.value}>
													{fuel.label}
												</option>
											))}
										</select>
									</VehicleFieldControl>
									{form.formState.errors.supportedFuelType ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.supportedFuelType.message}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-price">Preço</Label>
									<VehicleFieldControl icon={BadgeDollarSign}>
										<Input
											autoComplete="off"
											className={vehicleFormInputClass}
											id="vehicle-form-price"
											inputMode="numeric"
											onChange={(event) => {
												const d = sanitizeMoneyDigitsInput(event.target.value);
												setPriceCentsDigits(d);
												const api = centsDigitsToApiDecimalString(d) ?? '0.00';
												form.setValue('price', api, {
													shouldDirty: true,
													shouldValidate: true,
												});
											}}
											placeholder="R$ 0,00"
											value={formatCentsDigitsToBrlDisplay(priceCentsDigits)}
										/>
									</VehicleFieldControl>
									{form.formState.errors.price ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.price.message}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-status">Status</Label>
									<VehicleFieldControl icon={ShieldCheck}>
										<select
											className={vehicleFormSelectClass}
											id="vehicle-form-status"
											onChange={(event) =>
												form.setValue(
													'status',
													event.target.value as VehicleFormInput['status'],
													{
														shouldDirty: true,
														shouldValidate: true,
													},
												)
											}
											value={statusValue}
										>
											{vehicleStatusOptions.map((status) => (
												<option key={status.value} value={status.value}>
													{status.label}
												</option>
											))}
										</select>
									</VehicleFieldControl>
									{form.formState.errors.status ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.status.message}
										</p>
									) : null}
								</div>
							</div>
						</VehicleModalSection>

						<VehicleModalSection
							description="Informações utilizadas para identificação e consulta do veículo."
							title="Documentos e identificação"
						>
							<div className="grid gap-5 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="vehicle-form-plate">Placa</Label>
									<VehicleFieldControl icon={IdCard}>
										<Input
											className={vehicleFormInputClass}
											id="vehicle-form-plate"
											onChange={(event) =>
												form.setValue('plate', event.target.value, {
													shouldDirty: true,
													shouldValidate: true,
												})
											}
											placeholder="Opcional"
											value={plateValue ?? ''}
										/>
									</VehicleFieldControl>
									{form.formState.errors.plate ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.plate.message as string}
										</p>
									) : null}
								</div>
								<div className="space-y-2">
									<Label htmlFor="vehicle-form-vin">Chassi (VIN)</Label>
									<VehicleFieldControl icon={Barcode}>
										<Input
											className={vehicleFormInputClass}
											id="vehicle-form-vin"
											onChange={(event) =>
												form.setValue('vin', event.target.value, {
													shouldDirty: true,
													shouldValidate: true,
												})
											}
											placeholder="Opcional"
											value={vinValue ?? ''}
										/>
									</VehicleFieldControl>
									{form.formState.errors.vin ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.vin.message as string}
										</p>
									) : null}
								</div>
							</div>
						</VehicleModalSection>

						<VehicleStatusSummary status={statusValue} />
					</div>

					<DialogFooter className="shrink-0 justify-between gap-3 border-t-0 px-7 pb-6 pt-3 md:flex-row md:px-8">
						<div>
							{isEditMode && targetVehicle && onRequestDeactivate ? (
								<Button
									className="rounded-lg border-red-200 bg-white text-red-600 shadow-none hover:bg-red-50"
									disabled={isPending || targetVehicle.status === 'INACTIVE'}
									onClick={() => onRequestDeactivate(targetVehicle)}
									type="button"
									variant="outline"
								>
									<Archive className="size-4" />
									Inativar veículo
								</Button>
							) : null}
						</div>
						<div className="flex flex-col-reverse gap-2 sm:flex-row">
							<Button
								className="rounded-lg"
								onClick={onClose}
								type="button"
								variant="outline"
							>
								Cancelar
							</Button>
							<Button
								className="rounded-lg bg-[#172033] px-5 hover:bg-[#111827]"
								disabled={isPending}
								type="submit"
							>
								<Save className="size-4" />
								{isPending
									? isEditMode
										? 'Salvando...'
										: 'Criando...'
									: isEditMode
										? 'Salvar alterações'
										: 'Criar veículo'}
							</Button>
						</div>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export { VehicleFormDialog, getVehiclesErrorMessage };
