'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
	Activity,
	AlertCircle,
	BadgeDollarSign,
	CalendarClock,
	CheckCircle2,
	IdCard,
	Info,
	Mail,
	Phone,
	Save,
	Store,
	Trash2,
	UserRound,
	UsersRound,
} from 'lucide-react';

import { ModalFormErrorBanner } from '@/components/feedback/ModalFormErrorBanner';
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
import { Label, requiredFieldProps } from '@/components/ui/label';

import type {
	CustomerCatalogItem,
	CustomerCatalogStatus,
	CustomerDialogMode,
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

type CustomerFieldErrors = Partial<
	Pick<CustomerFormState, 'name' | 'email' | 'phone' | 'cpf'>
>;

type CustomerFormDialogProps = {
	createPending: boolean;
	dialogError: string | null;
	dialogState: CustomerDialogState | null;
	fieldErrors?: CustomerFieldErrors;
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

type CustomerModalHeaderProps = {
	description: string;
	icon?: LucideIcon;
	title: string;
};

type CustomerModalSectionProps = {
	children: ReactNode;
	description?: string;
	title: string;
};

type CustomerModalInfoBannerProps = {
	children: ReactNode;
	tone?: 'info' | 'danger';
};

type CustomerFieldControlProps = {
	children: ReactNode;
	icon: LucideIcon;
};

type CustomerDetailProps = {
	children: ReactNode;
	icon: LucideIcon;
	label: string;
};

const customerModalContentClass =
	'flex max-h-[92vh] max-w-5xl flex-col overflow-hidden rounded-[1.35rem] border border-[#d8e0ea] bg-white shadow-[0_20px_70px_rgba(15,23,42,0.18)]';

const customerFormInputClass =
	'h-11 rounded-xl border-[#cfd8e6] bg-white pl-10 text-sm shadow-none focus-visible:border-[#f05a28]/45 focus-visible:ring-2 focus-visible:ring-[#f05a28]/10';

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

function formatCustomerStatus(status: CustomerCatalogStatus) {
	switch (status) {
		case 'ACTIVE':
			return 'Ativo';
		case 'INACTIVE':
			return 'Inativo';
		default: {
			const _exhaustive: never = status;
			return _exhaustive;
		}
	}
}

function formatDateTime(value: Date | null) {
	if (!value) {
		return 'Sem atividade';
	}

	return value.toLocaleString('pt-BR', {
		dateStyle: 'short',
		timeStyle: 'short',
	});
}

function formatCustomerSource(value: string | null) {
	switch (value) {
		case 'INDICATION':
			return 'Indicação';
		case 'WEBSITE':
			return 'Site / Formulário';
		case 'WHATSAPP':
			return 'WhatsApp';
		case 'INSTAGRAM':
			return 'Instagram';
		case 'FACEBOOK':
			return 'Facebook';
		case 'MERCADO_LIVRE':
			return 'Mercado Livre';
		case 'PHONE':
			return 'Telefone';
		case 'SOCIAL_MEDIA':
			return 'Redes sociais';
		case 'WALK_IN':
			return 'Loja física';
		case 'Cadastro':
			return 'Cadastro';
		case null:
			return 'Não informada';
		default:
			return value;
	}
}

function CustomerModalHeader({
	description,
	icon: Icon = UserRound,
	title,
}: CustomerModalHeaderProps) {
	return (
		<DialogHeader className="border-b-0 px-7 pt-7 pb-4 md:px-8">
			<div className="flex items-start gap-4 pr-10">
				<div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-[#ff5a1f]/10 bg-[#ff5a1f]/10 text-[#ff4f17]">
					<Icon className="size-8" />
				</div>
				<div className="min-w-0 pt-0.5">
					<p className="text-[0.7rem] font-bold tracking-[0.26em] text-[#ff4f17] uppercase">
						Clientes
					</p>
					<DialogTitle className="mt-1 text-2xl font-bold tracking-normal text-[#121a2b]">
						{title}
					</DialogTitle>
					<DialogDescription className="mt-1 max-w-2xl text-sm leading-6 text-[#66708a]">
						{description}
					</DialogDescription>
				</div>
			</div>
		</DialogHeader>
	);
}

function CustomerModalInfoBanner({
	children,
	tone = 'info',
}: CustomerModalInfoBannerProps) {
	const isDanger = tone === 'danger';

	return (
		<div
			className={
				isDanger
					? 'flex items-center gap-3 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3 text-sm text-[#7f1d1d]'
					: 'flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-sm text-[#506078]'
			}
		>
			{isDanger ? (
				<AlertCircle className="size-5 shrink-0 text-red-600" />
			) : (
				<Info className="size-5 shrink-0 text-blue-600" />
			)}
			<p className="leading-6">{children}</p>
		</div>
	);
}

function CustomerModalSection({
	children,
	description,
	title,
}: CustomerModalSectionProps) {
	return (
		<section className="rounded-2xl border border-[#dfe7f1] bg-white p-4 md:p-5">
			<div className="mb-4 space-y-1">
				<h3 className="text-sm font-bold text-[#1b2537]">{title}</h3>
				{description ? (
					<p className="text-xs leading-5 text-[#6d7890]">{description}</p>
				) : null}
			</div>
			{children}
		</section>
	);
}

function CustomerFieldControl({
	children,
	icon: Icon,
}: CustomerFieldControlProps) {
	return (
		<div className="relative">
			<Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#6b7687]" />
			{children}
		</div>
	);
}

function CustomerDetail({ children, icon: Icon, label }: CustomerDetailProps) {
	return (
		<div className="rounded-xl border border-[#e7edf5] bg-[#f8fafc] p-4">
			<p className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-[#667085] uppercase">
				<Icon className="size-3.5" />
				{label}
			</p>
			<p className="mt-2 text-sm font-medium break-words text-[#101828]">
				{children}
			</p>
		</div>
	);
}

function CustomerFormDialog({
	createPending,
	dialogError,
	dialogState,
	fieldErrors = {},
	formState,
	onClose,
	onSave,
	onStateChange,
	updatePending,
}: CustomerFormDialogProps) {
	const isEditMode = dialogState?.mode === 'edit';
	const isPending = createPending || updatePending;

	return (
		<Dialog
			onOpenChange={(open) => !open && onClose()}
			open={dialogState !== null}
		>
			<DialogContent className={`${customerModalContentClass} max-w-3xl`}>
				<CustomerModalHeader
					description={
						isEditMode
							? 'Atualize os dados comerciais mantendo a consistência do cadastro operacional.'
							: 'Cadastre um cliente no CRM para relacionar leads, contatos e negociações.'
					}
					icon={UserRound}
					title={isEditMode ? 'Editar cliente' : 'Novo cliente'}
				/>

				<form
					className="flex min-h-0 flex-1 flex-col overflow-hidden"
					onSubmit={(event) => {
						event.preventDefault();
						onSave();
					}}
				>
					<div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-7 pt-3 pb-6 md:px-8">
						<ModalFormErrorBanner message={dialogError} />

						<CustomerModalSection
							description="Dados principais usados para identificar o cliente na operação."
							title="Dados do cliente"
						>
							<div className="grid gap-5 md:grid-cols-2">
								<div className="space-y-2 md:col-span-2">
									<Label htmlFor="customer-name" required>
										Nome
									</Label>
									<CustomerFieldControl icon={UserRound}>
										<Input
											className={customerFormInputClass}
											id="customer-name"
											onChange={(event) =>
												onStateChange((current) => ({
													...current,
													name: event.target.value,
												}))
											}
											value={formState.name}
											{...requiredFieldProps()}
										/>
									</CustomerFieldControl>
								</div>

								<div className="space-y-2">
									<Label htmlFor="customer-email">E-mail</Label>
									<CustomerFieldControl icon={Mail}>
										<Input
											aria-invalid={fieldErrors.email ? true : undefined}
											className={customerFormInputClass}
											id="customer-email"
											onChange={(event) =>
												onStateChange((current) => ({
													...current,
													email: event.target.value,
												}))
											}
											placeholder="Opcional"
											type="email"
											value={formState.email}
										/>
									</CustomerFieldControl>
									{fieldErrors.email ? (
										<p className="text-xs text-destructive">
											{fieldErrors.email}
										</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="customer-phone">Telefone</Label>
									<CustomerFieldControl icon={Phone}>
										<Input
											className={customerFormInputClass}
											id="customer-phone"
											onChange={(event) =>
												onStateChange((current) => ({
													...current,
													phone: event.target.value,
												}))
											}
											placeholder="Opcional"
											value={formState.phone}
										/>
									</CustomerFieldControl>
								</div>
							</div>
						</CustomerModalSection>

						<CustomerModalSection
							description="Informações utilizadas para identificação e consulta do cliente."
							title="Documentos e identificação"
						>
							<div className="grid gap-5 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="customer-cpf">CPF</Label>
									<CustomerFieldControl icon={IdCard}>
										<Input
											aria-invalid={fieldErrors.cpf ? true : undefined}
											className={customerFormInputClass}
											id="customer-cpf"
											onChange={(event) =>
												onStateChange((current) => ({
													...current,
													cpf: event.target.value,
												}))
											}
											placeholder="Opcional"
											value={formState.cpf}
										/>
									</CustomerFieldControl>
									{fieldErrors.cpf ? (
										<p className="text-xs text-destructive">
											{fieldErrors.cpf}
										</p>
									) : null}
								</div>
							</div>
						</CustomerModalSection>
					</div>

					<DialogFooter className="shrink-0 gap-3 border-t-0 px-7 pt-3 pb-6 md:flex-row md:px-8">
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
								? 'Salvando...'
								: isEditMode
									? 'Salvar alterações'
									: 'Criar cliente'}
						</Button>
					</DialogFooter>
				</form>
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
			<DialogContent className={`${customerModalContentClass} max-w-xl`}>
				<CustomerModalHeader
					description="Esta operação remove o cliente selecionado da base operacional."
					icon={Trash2}
					title="Excluir cliente"
				/>
				<div className="space-y-4 px-7 pt-3 pb-5">
					<CustomerModalInfoBanner tone="danger">
						Excluir um cliente pode afetar históricos e vínculos usados pelo
						CRM.
					</CustomerModalInfoBanner>
					<CustomerModalSection
						description="Confirme a ação para remover o cadastro."
						title="Confirmação"
					>
						<div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/60 px-4 py-4 text-sm text-[#7f1d1d]">
							<Trash2 className="mt-0.5 size-4 shrink-0 text-red-600" />
							<p>
								Cliente:{' '}
								<span className="font-semibold">
									{deleteTarget?.name ?? 'Não selecionado'}
								</span>
							</p>
						</div>
					</CustomerModalSection>
					<ModalFormErrorBanner message={deleteError} />
				</div>
				<DialogFooter className="border-t-0 px-7 pt-1 pb-6">
					<Button
						className="rounded-lg"
						onClick={onClose}
						type="button"
						variant="outline"
					>
						Cancelar
					</Button>
					<Button
						className="rounded-lg bg-[#172033] hover:bg-[#111827]"
						disabled={deletePending}
						onClick={onConfirm}
						type="button"
					>
						<Trash2 className="size-4" />
						{deletePending ? 'Excluindo...' : 'Excluir cliente'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function CustomerDetailsDialog({ item, onClose }: CustomerDetailsDialogProps) {
	if (!item) {
		return null;
	}

	return (
		<Dialog onOpenChange={(open) => !open && onClose()} open={item !== null}>
			<DialogContent className={customerModalContentClass}>
				<CustomerModalHeader
					description="Consulte a ficha comercial e operacional do cliente selecionado."
					icon={UserRound}
					title={item.customer.name}
				/>
				<div className="min-h-0 space-y-5 overflow-y-auto px-7 pt-3 pb-7 md:px-8">
					<div className="grid gap-4 lg:grid-cols-2">
						<CustomerModalSection
							description="Dados de identificação e contato do cadastro."
							title="Dados do cliente"
						>
							<div className="grid gap-4 text-sm md:grid-cols-2">
								<CustomerDetail icon={UserRound} label="Nome">
									{item.customer.name}
								</CustomerDetail>
								<CustomerDetail icon={IdCard} label="CPF">
									{item.customer.cpf ?? 'Não informado'}
								</CustomerDetail>
								<CustomerDetail icon={Mail} label="E-mail">
									{item.customer.email ?? 'Não informado'}
								</CustomerDetail>
								<CustomerDetail icon={Phone} label="Telefone">
									{item.customer.phone ?? 'Não informado'}
								</CustomerDetail>
							</div>
						</CustomerModalSection>

						<CustomerModalSection
							description="Origem e contexto comercial do relacionamento."
							title="Contexto do CRM"
						>
							<div className="grid gap-4 text-sm md:grid-cols-2">
								<CustomerDetail icon={Store} label="Loja vinculada">
									{item.primaryStoreName ?? 'Não vinculada'}
								</CustomerDetail>
								<CustomerDetail icon={Activity} label="Origem">
									{formatCustomerSource(item.source)}
								</CustomerDetail>
								<CustomerDetail icon={CalendarClock} label="Última atividade">
									{formatDateTime(item.lastActivityAt)}
								</CustomerDetail>
								<CustomerDetail icon={CheckCircle2} label="Status">
									{formatCustomerStatus(item.status)}
								</CustomerDetail>
							</div>
						</CustomerModalSection>

						<CustomerModalSection
							description="Indicadores derivados de leads e negociações vinculadas."
							title="Resumo comercial"
						>
							<div className="grid gap-4 text-sm md:grid-cols-2">
								<CustomerDetail icon={UsersRound} label="Leads vinculados">
									{item.leadCount}
								</CustomerDetail>
								<CustomerDetail icon={Activity} label="Negociações abertas">
									{item.openDealsCount}
								</CustomerDetail>
								<CustomerDetail icon={CheckCircle2} label="Negociações ganhas">
									{item.wonDealsCount}
								</CustomerDetail>
								<CustomerDetail icon={BadgeDollarSign} label="Valor total">
									{formatCurrency(item.totalDealValue)}
								</CustomerDetail>
							</div>
						</CustomerModalSection>
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
