'use client';

import {
	AlertCircle,
	BadgeDollarSign,
	Mail,
	Phone,
	UserRound,
} from 'lucide-react';

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
	CustomerCatalogItem,
	CustomerMutationInput,
	CustomerRecord,
} from '../model/customers.model';
import { formatCurrency } from './CustomersTable';

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

type CustomerDetailsDialogProps = {
	item: CustomerCatalogItem | null;
	onClose: () => void;
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

function CustomerDetailsDialog({ item, onClose }: CustomerDetailsDialogProps) {
	return (
		<Dialog onOpenChange={(open) => !open && onClose()} open={item !== null}>
			<DialogContent className="max-w-2xl rounded-[1.35rem] border-[#d8e0ea] bg-white">
				<DialogHeader className="border-b-0 px-7 pb-3 pt-7">
					<div className="flex items-start gap-4 pr-8">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-[#ff5a1f]/10 text-[#ff4f17]">
							<UserRound className="size-7" />
						</div>
						<div>
							<p className="text-[0.7rem] font-bold uppercase tracking-[0.26em] text-[#ff4f17]">
								Clientes
							</p>
							<DialogTitle className="mt-1 text-2xl font-bold text-[#101828]">
								{item?.customer.name ?? 'Cliente'}
							</DialogTitle>
							<DialogDescription>
								Resumo comercial do cliente no CRM.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<div className="grid gap-4 px-7 pb-7 pt-3">
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-2xl border border-[#e7edf5] bg-[#f8fafc] p-4">
							<p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#667085]">
								<Mail className="size-3.5" />
								E-mail
							</p>
							<p className="mt-2 text-sm font-medium text-[#101828]">
								{item?.customer.email ?? 'Não informado'}
							</p>
						</div>
						<div className="rounded-2xl border border-[#e7edf5] bg-[#f8fafc] p-4">
							<p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#667085]">
								<Phone className="size-3.5" />
								Telefone
							</p>
							<p className="mt-2 text-sm font-medium text-[#101828]">
								{item?.customer.phone ?? 'Não informado'}
							</p>
						</div>
					</div>
					<div className="grid gap-3 sm:grid-cols-3">
						<div className="rounded-2xl border border-[#e7edf5] p-4">
							<p className="text-xs text-[#667085]">Negociações abertas</p>
							<p className="mt-1 text-2xl font-bold text-[#101828]">
								{item?.openDealsCount ?? 0}
							</p>
						</div>
						<div className="rounded-2xl border border-[#e7edf5] p-4">
							<p className="text-xs text-[#667085]">Negociações ganhas</p>
							<p className="mt-1 text-2xl font-bold text-emerald-600">
								{item?.wonDealsCount ?? 0}
							</p>
						</div>
						<div className="rounded-2xl border border-[#e7edf5] p-4">
							<p className="flex items-center gap-2 text-xs text-[#667085]">
								<BadgeDollarSign className="size-3.5" />
								Valor total
							</p>
							<p className="mt-1 text-2xl font-bold text-[#101828]">
								{formatCurrency(item?.totalDealValue ?? '0')}
							</p>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export {
	emptyCustomerForm,
	CustomerDeleteDialog,
	CustomerDetailsDialog,
	CustomerFormDialog,
	toCustomerFormState,
	toCustomerPayload,
};
export type { CustomerDialogState, CustomerFormState };
