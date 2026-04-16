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

type StoreFormDialogProps = {
	dialogError: string | null;
	dialogState: StoreDialogState | null;
	isPending: boolean;
	onClose: () => void;
	onSave: () => void;
	onValueChange: (value: string) => void;
	value: string;
};

type StoreDeleteDialogProps = {
	deleteError: string | null;
	isPending: boolean;
	onClose: () => void;
	onConfirm: () => void;
	target: StoreRecord | null;
};

const emptyStoreName = '';

function toStorePayload(name: string): StoreMutationInput | null {
	const nextName = name.trim();
	if (!nextName) {
		return null;
	}

	return { name: nextName };
}

function StoreFormDialog({
	dialogError,
	dialogState,
	isPending,
	onClose,
	onSave,
	onValueChange,
	value,
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
							onChange={(event) => onValueChange(event.target.value)}
							value={value}
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
	emptyStoreName,
	StoreDeleteDialog,
	StoreFormDialog,
	toStorePayload,
	type StoreDialogState,
};
