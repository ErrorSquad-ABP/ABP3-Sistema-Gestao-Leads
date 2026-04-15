'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

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
import { cn } from '@/lib/utils';
import {
	useCreateCustomerMutation,
	useCreateStoreMutation,
	useUpdateCustomerMutation,
	useUpdateStoreMutation,
} from '../hooks/leads.catalog.mutations';
import { getCatalogCrudErrorMessage } from '../lib/catalog-crud-errors';
import {
	type CustomerCatalogFormValues,
	customerCatalogFormSchema,
	type StoreCatalogFormValues,
	storeCatalogFormSchema,
} from '../schemas/catalog-entity.schema';
import type { LeadCustomer, LeadStore } from '../model/leads.model';

const fieldInputClass =
	'flex h-10 w-full rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45';

type CustomerCatalogFormDialogProps = {
	open: boolean;
	mode: 'create' | 'edit';
	customer: LeadCustomer | null;
	onOpenChange: (open: boolean) => void;
	onSaved: (customer: LeadCustomer) => void;
};

function CustomerCatalogFormDialog({
	open,
	mode,
	customer,
	onOpenChange,
	onSaved,
}: CustomerCatalogFormDialogProps) {
	const [error, setError] = useState<string | null>(null);
	const createMutation = useCreateCustomerMutation();
	const updateMutation = useUpdateCustomerMutation();
	const form = useForm<CustomerCatalogFormValues>({
		resolver: zodResolver(customerCatalogFormSchema),
		defaultValues: {
			name: '',
			email: '',
			phone: '',
			cpf: '',
		},
	});

	useEffect(() => {
		if (!open) {
			return;
		}
		if (mode === 'edit' && customer) {
			form.reset({
				name: customer.name,
				email: customer.email ?? '',
				phone: customer.phone ?? '',
				cpf: customer.cpf ?? '',
			});
			return;
		}
		form.reset({
			name: '',
			email: '',
			phone: '',
			cpf: '',
		});
	}, [open, mode, customer, form]);

	const isPending = createMutation.isPending || updateMutation.isPending;

	async function handleSubmit(values: CustomerCatalogFormValues) {
		setError(null);
		const body = {
			name: values.name.trim(),
			email: values.email.trim() || null,
			phone: values.phone.trim() || null,
			cpf: values.cpf.trim() || null,
		};
		try {
			if (mode === 'create') {
				const created = await createMutation.mutateAsync(body);
				onSaved(created);
			} else if (customer) {
				const updated = await updateMutation.mutateAsync({
					id: customer.id,
					body,
				});
				onSaved(updated);
			}
			onOpenChange(false);
		} catch (nextError) {
			setError(getCatalogCrudErrorMessage(nextError));
		}
	}

	return (
		<Dialog
			onOpenChange={(next) => {
				if (next) {
					setError(null);
				}
				onOpenChange(next);
			}}
			open={open}
		>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{mode === 'create' ? 'Novo cliente' : 'Editar cliente'}
					</DialogTitle>
					<DialogDescription>
						{mode === 'create'
							? 'O nome é obrigatório; e-mail, telefone e CPF são opcionais.'
							: 'Atualize os dados do cliente selecionado.'}
					</DialogDescription>
				</DialogHeader>
				<form
					className="space-y-4 px-1 py-2"
					onSubmit={form.handleSubmit((v) => void handleSubmit(v))}
				>
					{error ? (
						<div className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							{error}
						</div>
					) : null}
					<div className="space-y-1.5">
						<Label htmlFor="catalog-customer-name">Nome</Label>
						<Input
							className={cn(
								fieldInputClass,
								form.formState.errors.name
									? 'border-destructive focus-visible:border-destructive'
									: null,
							)}
							id="catalog-customer-name"
							{...form.register('name')}
						/>
						{form.formState.errors.name ? (
							<p className="text-xs text-destructive">
								{form.formState.errors.name.message}
							</p>
						) : null}
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="catalog-customer-email">E-mail</Label>
						<Input
							className={cn(
								fieldInputClass,
								form.formState.errors.email
									? 'border-destructive focus-visible:border-destructive'
									: null,
							)}
							id="catalog-customer-email"
							inputMode="email"
							type="email"
							{...form.register('email')}
						/>
						{form.formState.errors.email ? (
							<p className="text-xs text-destructive">
								{form.formState.errors.email.message}
							</p>
						) : null}
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="catalog-customer-phone">Telefone</Label>
						<Input
							className={fieldInputClass}
							id="catalog-customer-phone"
							{...form.register('phone')}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="catalog-customer-cpf">CPF</Label>
						<Input
							className={fieldInputClass}
							id="catalog-customer-cpf"
							{...form.register('cpf')}
						/>
					</div>
					<DialogFooter className="gap-2 pt-2 sm:gap-0">
						<Button
							onClick={() => onOpenChange(false)}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button
							className="bg-[#2D3648] hover:bg-[#232B3B]"
							disabled={isPending}
							type="submit"
						>
							{isPending ? (
								<span className="inline-flex items-center gap-2">
									<LoaderCircle className="size-4 animate-spin" />A guardar…
								</span>
							) : mode === 'create' ? (
								'Criar cliente'
							) : (
								'Guardar alterações'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

type StoreCatalogFormDialogProps = {
	open: boolean;
	mode: 'create' | 'edit';
	store: LeadStore | null;
	onOpenChange: (open: boolean) => void;
	onSaved: (store: LeadStore) => void;
};

function StoreCatalogFormDialog({
	open,
	mode,
	store,
	onOpenChange,
	onSaved,
}: StoreCatalogFormDialogProps) {
	const [error, setError] = useState<string | null>(null);
	const createMutation = useCreateStoreMutation();
	const updateMutation = useUpdateStoreMutation();
	const form = useForm<StoreCatalogFormValues>({
		resolver: zodResolver(storeCatalogFormSchema),
		defaultValues: { name: '' },
	});

	useEffect(() => {
		if (!open) {
			return;
		}
		if (mode === 'edit' && store) {
			form.reset({ name: store.name });
			return;
		}
		form.reset({ name: '' });
	}, [open, mode, store, form]);

	const isPending = createMutation.isPending || updateMutation.isPending;

	async function handleSubmit(values: StoreCatalogFormValues) {
		setError(null);
		try {
			if (mode === 'create') {
				const created = await createMutation.mutateAsync({
					name: values.name.trim(),
				});
				onSaved(created);
			} else if (store) {
				const updated = await updateMutation.mutateAsync({
					id: store.id,
					body: { name: values.name.trim() },
				});
				onSaved(updated);
			}
			onOpenChange(false);
		} catch (nextError) {
			setError(getCatalogCrudErrorMessage(nextError));
		}
	}

	return (
		<Dialog
			onOpenChange={(next) => {
				if (next) {
					setError(null);
				}
				onOpenChange(next);
			}}
			open={open}
		>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{mode === 'create' ? 'Nova loja' : 'Editar loja'}
					</DialogTitle>
					<DialogDescription>
						{mode === 'create'
							? 'Cria uma loja no sistema. Apenas administrador ou gestor geral pode gerir lojas.'
							: 'Altere o nome da loja.'}
					</DialogDescription>
				</DialogHeader>
				<form
					className="space-y-4 px-1 py-2"
					onSubmit={form.handleSubmit((v) => void handleSubmit(v))}
				>
					{error ? (
						<div className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							{error}
						</div>
					) : null}
					<div className="space-y-1.5">
						<Label htmlFor="catalog-store-name">Nome da loja</Label>
						<Input
							className={cn(
								fieldInputClass,
								form.formState.errors.name
									? 'border-destructive focus-visible:border-destructive'
									: null,
							)}
							id="catalog-store-name"
							{...form.register('name')}
						/>
						{form.formState.errors.name ? (
							<p className="text-xs text-destructive">
								{form.formState.errors.name.message}
							</p>
						) : null}
					</div>
					<DialogFooter className="gap-2 pt-2 sm:gap-0">
						<Button
							onClick={() => onOpenChange(false)}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button
							className="bg-[#2D3648] hover:bg-[#232B3B]"
							disabled={isPending}
							type="submit"
						>
							{isPending ? (
								<span className="inline-flex items-center gap-2">
									<LoaderCircle className="size-4 animate-spin" />A guardar…
								</span>
							) : mode === 'create' ? (
								'Criar loja'
							) : (
								'Guardar alterações'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

type CatalogDeleteConfirmDialogProps = {
	open: boolean;
	title: string;
	description: string;
	confirmLabel: string;
	isPending: boolean;
	error: string | null;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => Promise<void>;
};

function CatalogDeleteConfirmDialog({
	open,
	title,
	description,
	confirmLabel,
	isPending,
	error,
	onOpenChange,
	onConfirm,
}: CatalogDeleteConfirmDialogProps) {
	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<div className="space-y-3 px-1 py-2">
					{error ? (
						<div className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							{error}
						</div>
					) : null}
				</div>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						onClick={() => onOpenChange(false)}
						type="button"
						variant="outline"
					>
						Cancelar
					</Button>
					<Button
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						disabled={isPending}
						onClick={() => {
							void onConfirm();
						}}
						type="button"
					>
						{isPending ? (
							<span className="inline-flex items-center gap-2">
								<LoaderCircle className="size-4 animate-spin" />A remover…
							</span>
						) : (
							confirmLabel
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export {
	CatalogDeleteConfirmDialog,
	CustomerCatalogFormDialog,
	StoreCatalogFormDialog,
};
