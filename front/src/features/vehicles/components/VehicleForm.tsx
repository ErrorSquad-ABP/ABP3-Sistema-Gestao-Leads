'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

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

type VehicleFormDialogProps = {
	isPending: boolean;
	mode: 'create' | 'edit';
	onClose: () => void;
	onSubmit: (values: VehicleFormOutput) => Promise<void>;
	open: boolean;
	stores: { id: string; name: string }[];
	targetVehicle: Vehicle | null;
};

const vehicleFormSelectClass =
	'flex h-11 w-full rounded-xl border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45';

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
			setPriceCentsDigits('');
			form.reset();
			return;
		}

		if (isEditMode && targetVehicle) {
			const priceAsApi = targetVehicle.price;
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
			return;
		}

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
			<DialogContent className="flex min-h-136 max-h-[84vh] max-w-4xl flex-col overflow-hidden rounded-[1.75rem] border border-[#d8e0ea] bg-white md:min-h-152">
				<DialogHeader className="gap-3 border-b border-[#e5ebf3] px-8 py-7">
					<div className="flex items-center gap-4">
						<div className="flex size-13 items-center justify-center rounded-2xl border border-[#d96c3f]/15 bg-[#d96c3f]/10 text-[#d96c3f]">
							<Plus className="size-6" />
						</div>
						<div className="space-y-1">
							<p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#d96c3f]">
								Veículos
							</p>
							<DialogTitle>
								{isEditMode ? 'Editar veículo' : 'Novo veículo'}
							</DialogTitle>
							<DialogDescription className="max-w-2xl">
								{isEditMode
									? 'Atualize os dados do veículo mantendo a consistência do catálogo.'
									: 'Cadastre um veículo no catálogo, associando a uma loja e definindo status e características.'}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<form
					className="flex min-h-0 flex-1 flex-col overflow-hidden"
					onSubmit={form.handleSubmit((values) => handleSubmit(values))}
				>
					<div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-8 pb-8 pt-7">
						{submitError ? (
							<div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
								{submitError}
							</div>
						) : null}

						<div className="rounded-3xl border border-[#e5ebf3] bg-[#f9fbfd] p-5">
							<div className="space-y-1">
								<Label
									className="text-base font-semibold text-[#1b2430]"
									htmlFor={
										isEditMode
											? 'vehicle-form-store-readonly'
											: 'vehicle-form-store'
									}
								>
									Loja
								</Label>
								<p className="text-sm leading-6 text-[#6b7687]">
									{isEditMode
										? 'A loja é fixa após o cadastro e não pode ser alterada nesta tela.'
										: 'A loja define onde o veículo está disponível.'}
								</p>
							</div>
							<div className="mt-4 space-y-2">
								{isEditMode ? (
									<div
										className="flex h-11 w-full items-center rounded-xl border border-[#d6dce5] bg-[#f2f4f7] px-3 text-sm text-[#1b2430]"
										id="vehicle-form-store-readonly"
									>
										{storeLabelById[
											targetVehicle?.storeId ?? selectedStoreId
										] ??
											targetVehicle?.storeId ??
											selectedStoreId}
									</div>
								) : (
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
								)}
								{form.formState.errors.storeId ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.storeId.message}
									</p>
								) : null}
							</div>
						</div>

						<div className="rounded-3xl border border-[#e5ebf3] bg-white p-5">
							<div className="mb-5 space-y-1">
								<h3 className="text-base font-semibold text-[#1b2430]">
									Dados do veículo
								</h3>
								<p className="text-sm leading-6 text-[#6b7687]">
									Preencha identificação, anos, quilometragem, combustível e
									preço.
								</p>
							</div>

							<div className="grid gap-5 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="vehicle-form-brand">Marca</Label>
									<Input
										className="h-11 rounded-xl border-[#d6dce5] bg-white shadow-none focus-visible:border-[#2d3648]/45"
										id="vehicle-form-brand"
										onChange={(event) =>
											form.setValue('brand', event.target.value, {
												shouldDirty: true,
												shouldValidate: true,
											})
										}
										value={brandValue ?? ''}
									/>
									{form.formState.errors.brand ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.brand.message}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-model">Modelo</Label>
									<Input
										className="h-11 rounded-xl border-[#d6dce5] bg-white shadow-none focus-visible:border-[#2d3648]/45"
										id="vehicle-form-model"
										onChange={(event) =>
											form.setValue('model', event.target.value, {
												shouldDirty: true,
												shouldValidate: true,
											})
										}
										value={modelValue ?? ''}
									/>
									{form.formState.errors.model ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.model.message}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-version">Versão</Label>
									<Input
										className="h-11 rounded-xl border-[#d6dce5] bg-white shadow-none focus-visible:border-[#2d3648]/45"
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
									{form.formState.errors.version ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.version.message as string}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-color">Cor</Label>
									<Input
										className="h-11 rounded-xl border-[#d6dce5] bg-white shadow-none focus-visible:border-[#2d3648]/45"
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
									{form.formState.errors.color ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.color.message as string}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-model-year">Ano do modelo</Label>
									<Input
										className="h-11 rounded-xl border-[#d6dce5] bg-white shadow-none focus-visible:border-[#2d3648]/45"
										id="vehicle-form-model-year"
										inputMode="numeric"
										autoComplete="off"
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
									<Input
										className="h-11 rounded-xl border-[#d6dce5] bg-white shadow-none focus-visible:border-[#2d3648]/45"
										id="vehicle-form-manufacture-year"
										inputMode="numeric"
										autoComplete="off"
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
									{form.formState.errors.manufactureYear ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.manufactureYear.message as string}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-mileage">Quilometragem</Label>
									<Input
										className="h-11 rounded-xl border-[#d6dce5] bg-white shadow-none focus-visible:border-[#2d3648]/45"
										id="vehicle-form-mileage"
										inputMode="numeric"
										autoComplete="off"
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
									{form.formState.errors.mileage ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.mileage.message}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-fuel">Combustível</Label>
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
									{form.formState.errors.supportedFuelType ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.supportedFuelType.message}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-price">Preço</Label>
									<Input
										className="h-11 rounded-xl border-[#d6dce5] bg-white shadow-none focus-visible:border-[#2d3648]/45"
										id="vehicle-form-price"
										inputMode="numeric"
										autoComplete="off"
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
									{form.formState.errors.price ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.price.message}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="vehicle-form-status">Status</Label>
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
									{form.formState.errors.status ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.status.message}
										</p>
									) : null}
								</div>
							</div>
						</div>

						<div className="rounded-3xl border border-[#e5ebf3] bg-white p-5">
							<div className="mb-5 space-y-1">
								<h3 className="text-base font-semibold text-[#1b2430]">
									Documentos e identificação
								</h3>
								<p className="text-sm leading-6 text-[#6b7687]">
									Placa e chassi (VIN) são opcionais.
								</p>
							</div>
							<div className="grid gap-5 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="vehicle-form-plate">Placa</Label>
									<Input
										className="h-11 rounded-xl border-[#d6dce5] bg-white shadow-none focus-visible:border-[#2d3648]/45"
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
									{form.formState.errors.plate ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.plate.message as string}
										</p>
									) : null}
								</div>
								<div className="space-y-2">
									<Label htmlFor="vehicle-form-vin">Chassi (VIN)</Label>
									<Input
										className="h-11 rounded-xl border-[#d6dce5] bg-white shadow-none focus-visible:border-[#2d3648]/45"
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
									{form.formState.errors.vin ? (
										<p className="text-xs text-destructive">
											{form.formState.errors.vin.message as string}
										</p>
									) : null}
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
							disabled={isPending}
							type="submit"
						>
							{isPending
								? isEditMode
									? 'Salvando...'
									: 'Criando...'
								: isEditMode
									? 'Salvar alterações'
									: 'Criar veículo'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export { VehicleFormDialog, getVehiclesErrorMessage };
