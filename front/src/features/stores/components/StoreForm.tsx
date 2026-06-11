'use client';

import { Building2, PencilLine, Save, Trash2 } from 'lucide-react';

import { ModalFormErrorBanner } from '@/components/feedback/ModalFormErrorBanner';
import {
	AppModalBody,
	AppModalCancelButton,
	AppModalConfirmPanel,
	AppModalFooter,
	AppModalHeader,
	AppModalPrimaryButton,
	appModalContentClass,
} from '@/components/modals/AppModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label, requiredFieldProps } from '@/components/ui/label';

import type {
	StoreDialogMode,
	StoreMutationInput,
	StoreRecord,
} from '../model/stores.model';

type StoreDialogState = {
	mode: StoreDialogMode;
	store: StoreRecord | null;
};

type StoreFormValues = {
	addressLine: string;
	city: string;
	coverage: string;
	distributionRegion: string;
	name: string;
	region: string;
	scope: string;
	state: string;
};

type StoreFormDialogProps = {
	dialogError: string | null;
	dialogState: StoreDialogState | null;
	isPending: boolean;
	onClose: () => void;
	onSave: () => void;
	onValueChange: (field: keyof StoreFormValues, value: string) => void;
	values: StoreFormValues;
};

type StoreDeleteDialogProps = {
	deleteError: string | null;
	isPending: boolean;
	onClose: () => void;
	onConfirm: () => void;
	target: StoreRecord | null;
};

const emptyStoreFormValues: StoreFormValues = {
	addressLine: '',
	city: '',
	coverage: '',
	distributionRegion: '',
	name: '',
	region: '',
	scope: '',
	state: '',
};

function optionalText(value: string): string | null {
	const trimmed = value.trim();
	return trimmed ? trimmed : null;
}

function toStorePayload(values: StoreFormValues): StoreMutationInput | null {
	const nextName = values.name.trim();
	if (!nextName) {
		return null;
	}

	const state = optionalText(values.state)?.toUpperCase() ?? null;
	if (state !== null && !/^[A-Z]{2}$/.test(state)) {
		return null;
	}

	return {
		addressLine: optionalText(values.addressLine),
		city: optionalText(values.city),
		coverage: optionalText(values.coverage),
		distributionRegion: optionalText(values.distributionRegion),
		name: nextName,
		region: optionalText(values.region),
		scope: optionalText(values.scope),
		state,
	};
}

function StoreFormDialog({
	dialogError,
	dialogState,
	isPending,
	onClose,
	onSave,
	onValueChange,
	values,
}: StoreFormDialogProps) {
	return (
		<Dialog
			onOpenChange={(open) => !open && onClose()}
			open={dialogState !== null}
		>
			<DialogContent className={`${appModalContentClass} max-w-2xl`}>
				<AppModalHeader
					category="Lojas"
					description="Mantenha os dados das lojas disponíveis para o pipeline."
					icon={dialogState?.mode === 'edit' ? PencilLine : Building2}
					title={dialogState?.mode === 'edit' ? 'Editar loja' : 'Nova loja'}
				/>
				<form
					className="flex min-h-0 flex-1 flex-col overflow-hidden"
					onSubmit={(event) => {
						event.preventDefault();
						onSave();
					}}
				>
					<AppModalBody className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="store-name" required>
								Nome da loja
							</Label>
							<Input
								id="store-name"
								onChange={(event) => onValueChange('name', event.target.value)}
								value={values.name}
								{...requiredFieldProps()}
							/>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="grid gap-2">
								<Label htmlFor="store-address">Endereço</Label>
								<Input
									id="store-address"
									onChange={(event) =>
										onValueChange('addressLine', event.target.value)
									}
									value={values.addressLine}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="store-city">Cidade</Label>
								<Input
									id="store-city"
									onChange={(event) =>
										onValueChange('city', event.target.value)
									}
									value={values.city}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="store-state">UF</Label>
								<Input
									id="store-state"
									maxLength={2}
									minLength={2}
									pattern="[A-Za-z]{2}"
									onChange={(event) =>
										onValueChange('state', event.target.value.toUpperCase())
									}
									value={values.state}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="store-coverage">Cobertura</Label>
								<Input
									id="store-coverage"
									onChange={(event) =>
										onValueChange('coverage', event.target.value)
									}
									value={values.coverage}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="store-region">Região</Label>
								<Input
									id="store-region"
									onChange={(event) =>
										onValueChange('region', event.target.value)
									}
									value={values.region}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="store-distribution-region">
									Região de distribuição
								</Label>
								<Input
									id="store-distribution-region"
									onChange={(event) =>
										onValueChange('distributionRegion', event.target.value)
									}
									value={values.distributionRegion}
								/>
							</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="store-scope">Abrangência</Label>
							<Input
								id="store-scope"
								onChange={(event) => onValueChange('scope', event.target.value)}
								value={values.scope}
							/>
						</div>
						<ModalFormErrorBanner message={dialogError} />
					</AppModalBody>
					<AppModalFooter>
						<AppModalCancelButton onClick={onClose} type="button">
							Cancelar
						</AppModalCancelButton>
						<AppModalPrimaryButton disabled={isPending} type="submit">
							<Save className="size-4" />
							{isPending ? 'Salvando...' : 'Salvar loja'}
						</AppModalPrimaryButton>
					</AppModalFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function StoreDeleteDialog({
	deleteError,
	isPending,
	onClose,
	onConfirm,
	target,
}: StoreDeleteDialogProps) {
	return (
		<Dialog onOpenChange={(open) => !open && onClose()} open={target !== null}>
			<DialogContent className={`${appModalContentClass} max-w-lg`}>
				<AppModalHeader
					category="Lojas"
					description="Confirme a remoção da loja selecionada."
					icon={Trash2}
					title="Excluir loja"
					tone="danger"
				/>
				<AppModalBody>
					<AppModalConfirmPanel icon={Trash2}>
						Loja: <span className="font-medium">{target?.name}</span>
					</AppModalConfirmPanel>
					<ModalFormErrorBanner message={deleteError} />
				</AppModalBody>
				<AppModalFooter>
					<AppModalCancelButton onClick={onClose}>
						Cancelar
					</AppModalCancelButton>
					<AppModalPrimaryButton
						className="bg-red-600 hover:bg-red-700"
						disabled={isPending}
						onClick={onConfirm}
					>
						<Trash2 className="size-4" />
						{isPending ? 'Excluindo...' : 'Excluir'}
					</AppModalPrimaryButton>
				</AppModalFooter>
			</DialogContent>
		</Dialog>
	);
}

export {
	emptyStoreFormValues,
	StoreDeleteDialog,
	StoreFormDialog,
	toStorePayload,
	type StoreDialogState,
	type StoreFormValues,
};
