'use client';

import { AlertCircle, ShieldCheck } from 'lucide-react';

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
	LeadOwnerRecord,
	LeadStore,
} from '@/features/leads/model/leads.model';

import type { TeamDialogMode, TeamRecord } from '../model/teams.model';

type TeamDialogState = {
	mode: TeamDialogMode;
	team: TeamRecord | null;
};

type TeamFormState = {
	name: string;
	storeId: string;
	managerId: string;
};

type TeamFormDialogProps = {
	dialogError: string | null;
	dialogState: TeamDialogState | null;
	formState: TeamFormState;
	isPending: boolean;
	onClose: () => void;
	onSave: () => void;
	onStateChange: (updater: (current: TeamFormState) => TeamFormState) => void;
	owners: LeadOwnerRecord[];
	stores: LeadStore[];
};

type TeamDeleteDialogProps = {
	deleteError: string | null;
	isPending: boolean;
	onClose: () => void;
	onConfirm: () => void;
	target: TeamRecord | null;
};

const emptyTeamForm: TeamFormState = {
	name: '',
	storeId: '',
	managerId: '',
};

function toTeamPayload(formState: TeamFormState): TeamFormPayload | null {
	const name = formState.name.trim();
	if (!name || !formState.storeId) {
		return null;
	}

	return {
		name,
		storeId: formState.storeId,
		managerId: formState.managerId || null,
	};
}

function TeamFormDialog({
	dialogError,
	dialogState,
	formState,
	isPending,
	onClose,
	onSave,
	onStateChange,
	owners,
	stores,
}: TeamFormDialogProps) {
	return (
		<Dialog
			onOpenChange={(open) => !open && onClose()}
			open={dialogState !== null}
		>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>
						{dialogState?.mode === 'edit' ? 'Editar equipe' : 'Nova equipe'}
					</DialogTitle>
					<DialogDescription>
						Vincule a equipe a uma loja e, se desejar, a um gerente de
						referência.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 px-6 py-5">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="team-name">Nome da equipe</Label>
							<Input
								id="team-name"
								onChange={(event) =>
									onStateChange((current) => ({
										...current,
										name: event.target.value,
									}))
								}
								value={formState.name}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="team-store">Loja</Label>
							<select
								className="h-11 rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-ring"
								id="team-store"
								onChange={(event) =>
									onStateChange((current) => ({
										...current,
										storeId: event.target.value,
									}))
								}
								value={formState.storeId}
							>
								<option value="">Selecione uma loja</option>
								{stores.map((store) => (
									<option key={store.id} value={store.id}>
										{store.name}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="team-manager">Gerente da equipe</Label>
						<select
							className="h-11 rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-ring"
							id="team-manager"
							onChange={(event) =>
								onStateChange((current) => ({
									...current,
									managerId: event.target.value,
								}))
							}
							value={formState.managerId}
						>
							<option value="">Sem gerente</option>
							{owners.map((owner) => (
								<option key={owner.id} value={owner.id}>
									{owner.name} · {owner.email}
								</option>
							))}
						</select>
					</div>
					<div className="rounded-2xl border border-border/80 bg-[#f8fafc] px-4 py-3 text-sm text-muted-foreground">
						Os membros continuam refletidos pelo backend. Esta tela foca na
						organização visível de loja e gerente da equipe.
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
						{isPending ? 'Salvando...' : 'Salvar equipe'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function TeamDeleteDialog({
	deleteError,
	isPending,
	onClose,
	onConfirm,
	target,
}: TeamDeleteDialogProps) {
	return (
		<Dialog onOpenChange={(open) => !open && onClose()} open={target !== null}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Excluir equipe</DialogTitle>
					<DialogDescription>
						Confirme a remoção da equipe selecionada.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-3 px-6 py-5">
					<div className="inline-flex items-center gap-2 rounded-full bg-[#2d3648]/10 px-3 py-1 text-xs font-medium text-[#2d3648]">
						<ShieldCheck className="size-3.5" />
						Equipe
					</div>
					<p className="text-sm text-[#1b2430]">
						Equipe: <span className="font-medium">{target?.name}</span>
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
	emptyTeamForm,
	TeamDeleteDialog,
	TeamFormDialog,
	toTeamPayload,
	type TeamDialogState,
	type TeamFormState,
};
type TeamFormPayload = {
	name: string;
	storeId: string;
	managerId: string | null;
};
