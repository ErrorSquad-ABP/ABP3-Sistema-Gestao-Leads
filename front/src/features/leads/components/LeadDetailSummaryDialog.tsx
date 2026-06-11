'use client';

import {
	Building2,
	ExternalLink,
	FileText,
	Info,
	Mail,
	Phone,
	User,
	UserCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { appRoutes } from '@/lib/routes/app-routes';
import {
	formatLeadSourceLabel,
	formatLeadStatusLabel,
} from '../lib/lead-list-labels';
import type { LeadCatalogItem } from '../model/leads.model';

function formatCPF(value: string | null) {
	if (!value) return 'Não informado';
	const digits = value.replace(/\D/g, '');
	if (digits.length === 11) {
		return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
	}
	return value;
}

function formatPhone(value: string | null) {
	if (!value) {
		return 'Não informado';
	}
	const digits = value.replace(/\D/g, '');
	if (digits.length === 11) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
	}
	if (digits.length === 10) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
	}
	return value;
}

type LeadDetailSummaryDialogProps = {
	readonly leadItem: LeadCatalogItem | null;
	readonly open: boolean;
	readonly onClose: () => void;
};

export function LeadDetailSummaryDialog({
	leadItem,
	open,
	onClose,
}: LeadDetailSummaryDialogProps) {
	const router = useRouter();

	if (!leadItem) return null;

	const { lead, customer, store, owner } = leadItem;

	function handleNavigateToFull() {
		onClose();
		router.push(`${appRoutes.app.leads}/${lead.id}`);
	}

	return (
		<Dialog open={open} onOpenChange={(val) => !val && onClose()}>
			<DialogContent className="max-w-2xl overflow-hidden rounded-[1.75rem] border border-[#d8e0ea] bg-white p-0">
				<DialogHeader className="gap-3 border-b border-[#e5ebf3] px-8 py-6">
					<div className="flex items-center gap-4">
						<div className="flex size-12 items-center justify-center rounded-2xl border border-[#f05a28]/15 bg-[#f05a28]/10 text-[#f05a28]">
							<Info className="size-5" />
						</div>
						<div className="space-y-0.5">
							<p className="text-[0.72rem] font-semibold tracking-[0.24em] text-[#f05a28] uppercase">
								Operacional
							</p>
							<DialogTitle className="text-xl font-bold text-[#101828]">
								Resumo do Lead
							</DialogTitle>
							<DialogDescription className="text-xs text-[#667085]">
								Visualize rapidamente os dados de contato e interesse do lead.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="max-h-[60vh] space-y-6 overflow-y-auto px-8 py-6">
					{/* Customer Information Section */}
					<div className="space-y-3">
						<h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
							<User className="size-4 text-[#667085]" />
							Dados do Cliente
						</h3>
						<div className="grid gap-3 sm:grid-cols-2">
							<div className="rounded-2xl border border-[#e5ebf3] bg-[#f8fafc] px-4 py-3">
								<p className="text-[0.72rem] font-semibold tracking-[0.1em] text-[#667085] uppercase">
									Nome Completo
								</p>
								<p className="mt-1 text-sm font-semibold text-[#101828]">
									{customer.name}
								</p>
							</div>
							<div className="rounded-2xl border border-[#e5ebf3] bg-[#f8fafc] px-4 py-3">
								<p className="text-[0.72rem] font-semibold tracking-[0.1em] text-[#667085] uppercase">
									CPF
								</p>
								<p className="mt-1 text-sm font-medium text-[#344054]">
									{formatCPF(customer.cpf)}
								</p>
							</div>
							<div className="rounded-2xl border border-[#e5ebf3] bg-[#f8fafc] px-4 py-3 flex items-center gap-3">
								<Mail className="size-4 text-[#667085]" />
								<div className="min-w-0">
									<p className="text-[0.72rem] font-semibold tracking-[0.1em] text-[#667085] uppercase">
										E-mail
									</p>
									<p className="mt-0.5 truncate text-sm font-medium text-[#344054]">
										{customer.email ?? 'Não informado'}
									</p>
								</div>
							</div>
							<div className="rounded-2xl border border-[#e5ebf3] bg-[#f8fafc] px-4 py-3 flex items-center gap-3">
								<Phone className="size-4 text-[#667085]" />
								<div>
									<p className="text-[0.72rem] font-semibold tracking-[0.1em] text-[#667085] uppercase">
										Telefone
									</p>
									<p className="mt-0.5 text-sm font-medium text-[#344054]">
										{formatPhone(customer.phone)}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Operational Details Section */}
					<div className="space-y-3">
						<h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
							<Building2 className="size-4 text-[#667085]" />
							Informações da Operação
						</h3>
						<div className="grid gap-3 sm:grid-cols-2">
							<div className="rounded-2xl border border-[#e5ebf3] bg-[#f8fafc] px-4 py-3">
								<p className="text-[0.72rem] font-semibold tracking-[0.1em] text-[#667085] uppercase">
									Status
								</p>
								<p className="mt-1 text-sm font-medium text-[#344054]">
									{formatLeadStatusLabel(lead.status)}
								</p>
							</div>
							<div className="rounded-2xl border border-[#e5ebf3] bg-[#f8fafc] px-4 py-3">
								<p className="text-[0.72rem] font-semibold tracking-[0.1em] text-[#667085] uppercase">
									Origem
								</p>
								<p className="mt-1 text-sm font-medium text-[#344054]">
									{formatLeadSourceLabel(lead.source)}
								</p>
							</div>
							<div className="rounded-2xl border border-[#e5ebf3] bg-[#f8fafc] px-4 py-3">
								<p className="text-[0.72rem] font-semibold tracking-[0.1em] text-[#667085] uppercase">
									Loja Atribuída
								</p>
								<p className="mt-1 text-sm font-medium text-[#344054]">
									{store.name}
								</p>
							</div>
							<div className="rounded-2xl border border-[#e5ebf3] bg-[#f8fafc] px-4 py-3 flex items-center gap-3">
								<UserCheck className="size-4 text-[#667085]" />
								<div>
									<p className="text-[0.72rem] font-semibold tracking-[0.1em] text-[#667085] uppercase">
										Responsável
									</p>
									<p className="mt-0.5 text-sm font-medium text-[#344054]">
										{owner?.name ?? 'Sem responsável'}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Product of Interest Section */}
					<div className="space-y-3">
						<h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
							<FileText className="size-4 text-[#667085]" />
							Produto de Interesse
						</h3>
						<div className="rounded-2xl border border-[#e5ebf3] bg-[#f8fafc] px-4 py-4">
							<p className="text-sm text-[#344054] leading-relaxed">
								{lead.vehicleInterestText ??
									'Nenhum produto/veículo de interesse informado.'}
							</p>
						</div>
					</div>
				</div>

				<DialogFooter className="border-t border-[#e5ebf3] bg-[#f8fafc] px-8 py-4 gap-2 sm:gap-0">
					<Button
						onClick={onClose}
						type="button"
						variant="outline"
						className="rounded-xl"
					>
						Fechar
					</Button>
					<Button
						className="bg-[#f05a28] hover:bg-[#df4f1f] text-white rounded-xl shadow-none"
						onClick={handleNavigateToFull}
						type="button"
					>
						Acessar hub completo
						<ExternalLink className="ml-2 size-4" />
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
