'use client';

import {
	ChevronDown,
	CirclePlus,
	FileText,
	Handshake,
	Info,
	ListChecks,
	Rocket,
	Search,
	Tag,
	Trophy,
	User,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

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
import { useLeadCustomersQuery } from '@/features/leads/hooks/leads.catalog.queries';
import { useLeadsListQuery } from '@/features/leads/hooks/leads.queries';
import type { LeadListItem } from '@/features/leads/model/leads.model';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { useVehiclesListQuery } from '@/features/vehicles/hooks/vehicles.queries';
import type { Vehicle } from '@/features/vehicles/model/vehicles.model';
import { ApiError } from '@/lib/http/api-error';
import { useCreateDealForLeadMutation } from '../hooks/deals.mutations';
import {
	apiDecimalStringToCentsDigits,
	centsDigitsToApiDecimalString,
	formatCentsDigitsToBrlDisplay,
	sanitizeMoneyDigitsInput,
} from '../lib/deal-money-input';
import type { DealCreateFormInput, DealCreateInput } from '../model/deals.model';
import { dealCreateSchema } from '../schemas/deal-management.schema';
import { getDealsErrorMessage } from './DealFormDialog';

type DealCreateDialogProps = {
	onClose: () => void;
	open: boolean;
	user: AuthenticatedUser;
};

function formatVehicleOptionLabel(vehicle: Vehicle) {
	const plate = vehicle.plate ? vehicle.plate.trim() : '';
	return `${vehicle.brand} ${vehicle.model} ${vehicle.modelYear} · ${plate || 'Sem placa'}`;
}

function getLeadOptionLabel(
	lead: LeadListItem,
	customers: { id: string; name: string }[],
) {
	const customerName =
		customers.find((customer) => customer.id === lead.customerId)?.name ??
		'Cliente não identificado';
	return `${customerName} · ${lead.id.slice(0, 8)}`;
}

function normalizeSearch(value: string) {
	return value.trim().toLowerCase();
}

const fieldShellClass =
	'relative flex h-10 items-center rounded-xl border border-[#d9dee7] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.025)] transition-colors focus-within:border-[#d76b34]/45';

const inputClass =
	'h-full rounded-xl border-0 bg-transparent px-3 text-[13px] shadow-none outline-none focus-visible:border-transparent focus-visible:ring-0';

const searchableInputClass =
	'h-full w-full rounded-xl border-0 bg-transparent py-0 pl-10 pr-9 text-[13px] text-[#1b2430] shadow-none outline-none placeholder:text-[#9aa3b2] focus-visible:border-transparent focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-60';

const dropdownPanelClass =
	'absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-36 overflow-y-auto rounded-xl border border-[#e5e9f0] bg-white p-1 shadow-[0_12px_34px_rgba(15,23,42,0.12)]';

const dropdownItemClass =
	'w-full rounded-lg px-3 py-1.5 text-left text-[13px] text-[#1b2430] hover:bg-[color:var(--brand-accent-soft)]/35';

const darkToastOptions = {
	style: {
		background: 'var(--sidebar)',
		color: 'var(--sidebar-foreground)',
		border: '1px solid var(--sidebar-border)',
	},
};

function DealCreateDialog({ onClose, open, user }: DealCreateDialogProps) {
	const leadsQuery = useLeadsListQuery(user, 1, { withoutOpenDeal: true });
	const customersQuery = useLeadCustomersQuery();
	const leads = useMemo(() => leadsQuery.data ?? [], [leadsQuery.data]);

	const [leadId, setLeadId] = useState('');
	const selectedLead = useMemo(
		() => leads.find((lead) => lead.id === leadId) ?? null,
		[leadId, leads],
	);
	const createMutation = useCreateDealForLeadMutation(leadId);
	const vehiclesQuery = useVehiclesListQuery(
		{
			status: 'AVAILABLE',
			withoutOpenDeal: true,
		},
		{
			enabled: Boolean(open && selectedLead),
		},
	);
	const availableVehicles = useMemo(
		() =>
			(vehiclesQuery.data ?? []).filter(
				(vehicle) => vehicle.storeId === selectedLead?.storeId,
			),
		[selectedLead?.storeId, vehiclesQuery.data],
	);

	const [vehicleId, setVehicleId] = useState('');
	const [leadSearch, setLeadSearch] = useState('');
	const [vehicleSearch, setVehicleSearch] = useState('');
	const [leadDropdownOpen, setLeadDropdownOpen] = useState(false);
	const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
	const [title, setTitle] = useState('');
	const [valueCentsDigits, setValueCentsDigits] = useState('');
	const [dialogError, setDialogError] = useState<string | null>(null);

	const filteredLeads = useMemo(() => {
		const search = normalizeSearch(leadSearch);
		if (!search) {
			return leads;
		}
		return leads.filter((lead) =>
			normalizeSearch(
				getLeadOptionLabel(lead, customersQuery.data ?? []),
			).includes(search),
		);
	}, [customersQuery.data, leadSearch, leads]);

	const filteredVehicles = useMemo(() => {
		const search = normalizeSearch(vehicleSearch);
		if (!search) {
			return availableVehicles;
		}
		return availableVehicles.filter((vehicle) =>
			normalizeSearch(formatVehicleOptionLabel(vehicle)).includes(search),
		);
	}, [availableVehicles, vehicleSearch]);

	function resetForm() {
		setLeadId('');
		setVehicleId('');
		setLeadSearch('');
		setVehicleSearch('');
		setLeadDropdownOpen(false);
		setVehicleDropdownOpen(false);
		setTitle('');
		setValueCentsDigits('');
		setDialogError(null);
	}

	function handleSelectLead(lead: LeadListItem) {
		setLeadId(lead.id);
		setLeadSearch(getLeadOptionLabel(lead, customersQuery.data ?? []));
		setVehicleId('');
		setVehicleSearch('');
		setValueCentsDigits('');
		setLeadDropdownOpen(false);
	}

	function handleSelectVehicle(vehicle: Vehicle) {
		setVehicleId(vehicle.id);
		setVehicleSearch(formatVehicleOptionLabel(vehicle));
		setValueCentsDigits(apiDecimalStringToCentsDigits(vehicle.price));
		setVehicleDropdownOpen(false);
	}

	async function handleCreateSubmit() {
		if (!leadId) {
			const message = 'Selecione um lead para criar a negociação.';
			setDialogError(message);
			toast.warning(message, {
				id: 'deal-create-missing-lead',
				...darkToastOptions,
			});
			return;
		}
		setDialogError(null);
		try {
			const valueAsApi = centsDigitsToApiDecimalString(valueCentsDigits);
			const parsed = dealCreateSchema.parse({
				vehicleId,
				title,
				value: valueAsApi,
				stage: 'INITIAL_CONTACT',
			} satisfies DealCreateFormInput) as DealCreateInput;
			await createMutation.mutateAsync(parsed);
			toast.success('Negociação criada com sucesso.', {
				...darkToastOptions,
			});
			resetForm();
			onClose();
		} catch (error) {
			const message = getDealsErrorMessage(error);
			setDialogError(message);
			toast.error(message, {
				...darkToastOptions,
			});
		}
	}

	return (
		<Dialog
			onOpenChange={(nextOpen) => {
				if (nextOpen) return;
				resetForm();
				onClose();
			}}
			open={open}
		>
			<DialogContent className="max-h-[min(92vh,760px)] max-w-2xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[18px] border-[#e7ebf0] p-0 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
				<DialogHeader className="flex-row items-start gap-3 px-6 py-4 sm:px-7">
					<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-accent-soft)]/45 text-[color:var(--brand-accent)]">
						<CirclePlus className="size-6" />
					</div>
					<div className="min-w-0 space-y-1">
						<DialogTitle className="text-[1.35rem] font-bold leading-tight tracking-[-0.02em] text-[#1b2430]">
							Nova negociação
						</DialogTitle>
						<DialogDescription className="space-y-0 text-[12.5px] leading-[18px] text-[#7a8494]">
							<span className="block">
								Selecione o lead e informe veículo, título e valor.
							</span>
							<span className="block">
								A negociação será criada na etapa de Contato inicial.
							</span>
						</DialogDescription>
					</div>
				</DialogHeader>
				<div className="min-h-0 space-y-3 overflow-y-auto px-6 py-4 sm:px-7">
					{dialogError ? (
						<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							{dialogError}
						</div>
					) : null}
					{leadsQuery.isError ? (
						<div
							className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
							role="alert"
						>
							{leadsQuery.error instanceof ApiError
								? leadsQuery.error.message
								: 'Não foi possível carregar os leads.'}
						</div>
					) : null}
					<div className="space-y-1">
						<Label
							className="text-[12.5px] font-semibold text-[#1b2430]"
							htmlFor="deal-create-lead"
						>
							Lead <span className="text-[color:var(--brand-accent)]">*</span>
						</Label>
						<div className={fieldShellClass}>
							<User className="pointer-events-none absolute left-3.5 size-4 text-[#4b5565]" />
							<input
								autoComplete="off"
								className={searchableInputClass}
								disabled={leadsQuery.isPending || leads.length === 0}
								id="deal-create-lead"
								onChange={(e) => {
									setLeadSearch(e.target.value);
									setLeadId('');
									setVehicleId('');
									setVehicleSearch('');
									setValueCentsDigits('');
									setLeadDropdownOpen(true);
								}}
								onBlur={() => {
									window.setTimeout(() => setLeadDropdownOpen(false), 120);
								}}
								onFocus={() => setLeadDropdownOpen(true)}
								placeholder={
									leadsQuery.isPending
										? 'Carregando leads...'
										: leads.length === 0
											? 'Nenhum lead disponível'
											: 'Selecione um lead'
								}
								value={leadSearch}
							/>
							<ChevronDown className="pointer-events-none absolute right-3.5 size-4 text-[#4b5565]" />
							{leadDropdownOpen && !leadsQuery.isPending && leads.length > 0 ? (
								<div className={dropdownPanelClass}>
									{filteredLeads.length > 0 ? (
										filteredLeads.map((lead) => (
											<button
												key={lead.id}
												className={dropdownItemClass}
												onMouseDown={(event) => {
													event.preventDefault();
													handleSelectLead(lead);
												}}
												type="button"
											>
												{getLeadOptionLabel(lead, customersQuery.data ?? [])}
											</button>
										))
									) : (
										<p className="px-3 py-2 text-sm text-[#7a8494]">
											Nenhum lead encontrado.
										</p>
									)}
								</div>
							) : null}
						</div>
						<p className="text-[11.5px] leading-4 text-[#7a8494]">
							Apenas leads sem negociação aberta são exibidos.
						</p>
					</div>
					<div className="space-y-1">
						<Label
							className="text-[12.5px] font-semibold text-[#1b2430]"
							htmlFor="deal-create-vehicle"
						>
							Veículo{' '}
							<span className="text-[color:var(--brand-accent)]">*</span>
						</Label>
						<div className={fieldShellClass}>
							<Search className="pointer-events-none absolute left-3.5 size-4 text-[#4b5565]" />
							<input
								autoComplete="off"
								className={searchableInputClass}
								disabled={!leadId || vehiclesQuery.isPending}
								id="deal-create-vehicle"
								onChange={(e) => {
									setVehicleSearch(e.target.value);
									setVehicleId('');
									setValueCentsDigits('');
									setVehicleDropdownOpen(true);
								}}
								onBlur={() => {
									window.setTimeout(() => setVehicleDropdownOpen(false), 120);
								}}
								onFocus={() => setVehicleDropdownOpen(true)}
								placeholder={
									vehiclesQuery.isPending
										? 'Carregando veículos disponíveis...'
										: !leadId
											? 'Buscar veículo disponível...'
											: 'Buscar veículo disponível...'
								}
								value={vehicleSearch}
							/>
							<ChevronDown className="pointer-events-none absolute right-3.5 size-4 text-[#4b5565]" />
							{vehicleDropdownOpen &&
							leadId &&
							!vehiclesQuery.isPending &&
							availableVehicles.length > 0 ? (
								<div className={dropdownPanelClass}>
									{filteredVehicles.length > 0 ? (
										filteredVehicles.map((vehicle) => (
											<button
												key={vehicle.id}
												className={dropdownItemClass}
												onMouseDown={(event) => {
													event.preventDefault();
													handleSelectVehicle(vehicle);
												}}
												type="button"
											>
												{formatVehicleOptionLabel(vehicle)}
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
						{vehiclesQuery.isError ? (
							<p className="text-[11.5px] leading-4 text-destructive">
								{vehiclesQuery.error instanceof ApiError
									? vehiclesQuery.error.message
									: 'Não foi possível carregar veículos disponíveis.'}
							</p>
						) : vehiclesQuery.isSuccess && leadId && availableVehicles.length === 0 ? (
							<p className="text-[11.5px] leading-4 text-[#6b7687]">
								Nenhum veículo livre para negociação na loja deste lead.
							</p>
						) : (
							<p className="text-[11.5px] leading-4 text-[#7a8494]">
								Apenas veículos disponíveis e sem negociação aberta podem ser selecionados.
							</p>
						)}
					</div>
					<div className="flex items-center gap-3 rounded-xl border border-[#edf1f6] bg-[#f8fafc] px-3 py-2 text-[#667085]">
						<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#eef6ff] text-[#2f80c9]">
							<Info className="size-4" />
						</span>
						<p className="text-[11.5px] leading-4">
							Ao criar a negociação, o veículo selecionado será reservado
							automaticamente e ficará indisponível para outras negociações.
						</p>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="space-y-1">
							<Label
								className="text-[12.5px] font-semibold text-[#1b2430]"
								htmlFor="deal-create-title"
							>
								Título{' '}
								<span className="text-[color:var(--brand-accent)]">*</span>
							</Label>
							<div className={fieldShellClass}>
								<Tag className="pointer-events-none absolute left-3.5 size-4 text-[#4b5565]" />
								<Input
									className={`${inputClass} pl-10`}
									id="deal-create-title"
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Ex.: Proposta de Jeep Compass Limited"
									value={title}
								/>
							</div>
							<p className="text-[11.5px] leading-4 text-[#7a8494]">
								Dê um título claro para esta negociação.
							</p>
						</div>
						<div className="space-y-1">
							<Label
								className="text-[12.5px] font-semibold text-[#1b2430]"
								htmlFor="deal-create-value"
							>
								Valor <span className="text-[color:var(--brand-accent)]">*</span>
							</Label>
							<div className={fieldShellClass}>
								<span className="flex h-full w-10 shrink-0 items-center justify-center border-r border-[#e5e9f0] text-[13px] font-medium text-[#4b5565]">
									R$
								</span>
								<Input
									autoComplete="off"
									className={inputClass}
									id="deal-create-value"
									inputMode="numeric"
									onChange={(e) =>
										setValueCentsDigits(
											sanitizeMoneyDigitsInput(e.target.value),
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
					</div>
					<div className="flex items-center justify-between gap-4 rounded-xl border border-[#e7ebf0] bg-white px-3 py-3">
						<div className="flex min-w-0 items-center gap-3">
							<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-accent-soft)]/45 text-[color:var(--brand-accent)]">
								<ListChecks className="size-4" />
							</span>
							<div className="min-w-0">
								<p className="text-[13px] font-bold text-[#1b2430]">
									Resumo da negociação
								</p>
								<p className="text-[11.5px] text-[#7a8494]">
									Confira as informações antes de criar a negociação.
								</p>
							</div>
						</div>
						<div className="hidden shrink-0 items-center gap-2 text-center sm:flex">
							<div className="space-y-1 text-[10px] font-medium text-[color:var(--brand-accent)]">
								<span className="mx-auto flex size-7 items-center justify-center rounded-full bg-[color:var(--brand-accent-soft)]/45">
									<User className="size-3.5" />
								</span>
								<p>Contato inicial</p>
							</div>
							<span className="h-px w-5 bg-[#e5e9f0]" />
							<div className="space-y-1 text-[10px] font-medium text-[#7a8494]">
								<span className="mx-auto flex size-7 items-center justify-center rounded-full bg-[#f4f6f8]">
									<Handshake className="size-3.5" />
								</span>
								<p>Negociação</p>
							</div>
							<span className="h-px w-5 bg-[#e5e9f0]" />
							<div className="space-y-1 text-[10px] font-medium text-[#7a8494]">
								<span className="mx-auto flex size-7 items-center justify-center rounded-full bg-[#f4f6f8]">
									<FileText className="size-3.5" />
								</span>
								<p>Proposta</p>
							</div>
							<span className="h-px w-5 bg-[#e5e9f0]" />
							<div className="space-y-1 text-[10px] font-medium text-[#7a8494]">
								<span className="mx-auto flex size-7 items-center justify-center rounded-full bg-[#f4f6f8]">
									<Trophy className="size-3.5" />
								</span>
								<p>Fechamento</p>
							</div>
						</div>
					</div>
				</div>
				<DialogFooter className="px-6 py-3 sm:px-7">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						className="h-10 rounded-xl px-5 font-semibold shadow-none"
					>
						Cancelar
					</Button>
					<Button
						type="button"
						className="h-10 rounded-xl bg-[#101a33] px-5 font-semibold text-white shadow-none hover:bg-[#17223d]"
						disabled={
							createMutation.isPending ||
							!leadId ||
							!vehicleId ||
							(vehiclesQuery.isSuccess && availableVehicles.length === 0)
						}
						onClick={() => void handleCreateSubmit()}
					>
						<Rocket className="size-4" />
						{createMutation.isPending ? 'Criando...' : 'Criar negociação'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { DealCreateDialog };
