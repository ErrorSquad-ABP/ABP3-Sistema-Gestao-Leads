'use client';

import { AlertCircle } from 'lucide-react';

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
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{dialogState?.mode === 'edit' ? 'Editar loja' : 'Nova loja'}
					</DialogTitle>
					<DialogDescription>
						Mantenha os nomes das lojas disponíveis para o pipeline.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 px-6 py-5">
					<div className="grid gap-2">
						<Label htmlFor="store-name">Nome da loja</Label>
						<Input
							id="store-name"
							onChange={(event) => onValueChange('name', event.target.value)}
							value={values.name}
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
								onChange={(event) => onValueChange('city', event.target.value)}
								value={values.city}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="store-state">UF</Label>
							<Input
								id="store-state"
								maxLength={2}
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
					{dialogError ? (
						<div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							<AlertCircle className="mt-0.5 size-4" />
							<p>{dialogError}</p>
						</div>
					) : null}
				</div>
				<DialogFooter>
					<Button className="rounded-md" onClick={onClose} variant="outline">
						Cancelar
					</Button>
					<Button
						className="rounded-md bg-[#2D3648] shadow-none hover:bg-[#232B3B]"
						disabled={isPending}
						onClick={onSave}
					>
						{isPending ? 'Salvando...' : 'Salvar loja'}
					</Button>
				</DialogFooter>
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
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Excluir loja</DialogTitle>
					<DialogDescription>
						Confirme a remoção da loja selecionada.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-3 px-6 py-5">
					<p className="text-sm text-[#1b2430]">
						Loja: <span className="font-medium">{target?.name}</span>
					</p>
					{deleteError ? (
						<div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							<AlertCircle className="mt-0.5 size-4" />
							<p>{deleteError}</p>
						</div>
					) : null}
				</div>
				<DialogFooter>
					<Button className="rounded-md" onClick={onClose} variant="outline">
						Cancelar
					</Button>
					<Button
						className="rounded-md shadow-none"
						disabled={isPending}
						onClick={onConfirm}
						variant="destructive"
					>
						{isPending ? 'Excluindo...' : 'Excluir'}
					</Button>
				</DialogFooter>
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
