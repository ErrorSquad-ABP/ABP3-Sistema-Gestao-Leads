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
	CustomerDialogMode,
	CustomerMutationInput,
	CustomerRecord,
} from '../model/customers.model';

type CustomerDialogState = {
	mode: CustomerDialogMode;
	customer: CustomerRecord | null;
};

type CustomerFormState = {
	name: string;
	email: string;
	phone: string;
	cpf: string;
};

type CustomerFormDialogProps = {
	createPending: boolean;
	dialogError: string | null;
	dialogState: CustomerDialogState | null;
	formState: CustomerFormState;
	onClose: () => void;
	onSave: () => void;
	onStateChange: (
		updater: (current: CustomerFormState) => CustomerFormState,
	) => void;
	updatePending: boolean;
};

type CustomerDeleteDialogProps = {
	deleteError: string | null;
	deletePending: boolean;
	deleteTarget: CustomerRecord | null;
	onClose: () => void;
	onConfirm: () => void;
};

const emptyCustomerForm: CustomerFormState = {
	name: '',
	email: '',
	phone: '',
	cpf: '',
};

function toCustomerFormState(
	customer: CustomerRecord | null,
): CustomerFormState {
	if (!customer) {
		return emptyCustomerForm;
	}

	return {
		name: customer.name,
		email: customer.email ?? '',
		phone: customer.phone ?? '',
		cpf: customer.cpf ?? '',
	};
}

function toCustomerPayload(
	form: CustomerFormState,
): CustomerMutationInput | null {
	const name = form.name.trim();
	if (!name) {
		return null;
	}

	return {
		name,
		email: form.email.trim() ? form.email.trim() : null,
		phone: form.phone.trim() ? form.phone.trim() : null,
		cpf: form.cpf.trim() ? form.cpf.trim() : null,
	};
}

function CustomerFormDialog({
	createPending,
	dialogError,
	dialogState,
	formState,
	onClose,
	onSave,
	onStateChange,
	updatePending,
}: CustomerFormDialogProps) {
	return (
		<Dialog
			onOpenChange={(open) => !open && onClose()}
			open={dialogState !== null}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{dialogState?.mode === 'edit' ? 'Editar cliente' : 'Novo cliente'}
					</DialogTitle>
					<DialogDescription>
						Cadastre ou ajuste os dados comerciais usados na operação de leads.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 px-6 py-5">
					<div className="grid gap-2">
						<Label htmlFor="customer-name">Nome</Label>
						<Input
							id="customer-name"
							onChange={(event) =>
								onStateChange((current) => ({
									...current,
									name: event.target.value,
								}))
							}
							value={formState.name}
						/>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="customer-email">E-mail</Label>
							<Input
								id="customer-email"
								onChange={(event) =>
									onStateChange((current) => ({
										...current,
										email: event.target.value,
									}))
								}
								value={formState.email}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="customer-phone">Telefone</Label>
							<Input
								id="customer-phone"
								onChange={(event) =>
									onStateChange((current) => ({
										...current,
										phone: event.target.value,
									}))
								}
								value={formState.phone}
							/>
						</div>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="customer-cpf">CPF</Label>
						<Input
							id="customer-cpf"
							onChange={(event) =>
								onStateChange((current) => ({
									...current,
									cpf: event.target.value,
								}))
							}
							value={formState.cpf}
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
						disabled={createPending || updatePending}
						onClick={onSave}
					>
						{createPending || updatePending
							? 'Salvando...'
							: dialogState?.mode === 'edit'
								? 'Salvar alterações'
								: 'Criar cliente'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function CustomerDeleteDialog({
	deleteError,
	deletePending,
	deleteTarget,
	onClose,
	onConfirm,
}: CustomerDeleteDialogProps) {
	return (
		<Dialog
			onOpenChange={(open) => !open && onClose()}
			open={deleteTarget !== null}
		>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Excluir cliente</DialogTitle>
					<DialogDescription>
						Esta operação remove o cliente selecionado da base operacional.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-3 px-6 py-5">
					<p className="text-sm text-[#1b2430]">
						Cliente: <span className="font-medium">{deleteTarget?.name}</span>
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
						disabled={deletePending}
						onClick={onConfirm}
						variant="destructive"
					>
						{deletePending ? 'Excluindo...' : 'Excluir'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export {
	emptyCustomerForm,
	CustomerDeleteDialog,
	CustomerFormDialog,
	toCustomerFormState,
	toCustomerPayload,
};
export type { CustomerDialogState, CustomerFormState };
