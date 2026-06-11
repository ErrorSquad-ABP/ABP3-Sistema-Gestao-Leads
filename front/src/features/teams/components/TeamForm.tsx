'use client';

import {
	PencilLine,
	Save,
	ShieldCheck,
	Trash2,
	UsersRound,
} from 'lucide-react';

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
	LeadOwnerRecord,
	LeadStore,
} from '@/features/leads/model/leads.model';
import type { TeamMemberCandidate } from '@/features/teams/model/teams.model';

import type { TeamDialogMode, TeamRecord } from '../model/teams.model';
import { TeamMemberSelector } from './TeamMemberSelector';

type TeamDialogState = {
	mode: TeamDialogMode;
	team: TeamRecord | null;
};

type TeamFormState = {
	name: string;
	storeId: string;
	managerId: string;
	memberUserIds: string[];
};

type TeamFormDialogProps = {
	dialogError: string | null;
	dialogState: TeamDialogState | null;
	formState: TeamFormState;
	isPending: boolean;
	onClose: () => void;
	onSave: () => void;
	onStateChange: (updater: (current: TeamFormState) => TeamFormState) => void;
	memberCandidates: TeamMemberCandidate[];
	membersLoading?: boolean;
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
	memberUserIds: [],
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
		initialMemberUserIds: [...new Set(formState.memberUserIds)],
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
	memberCandidates,
	membersLoading = false,
	owners,
	stores,
}: TeamFormDialogProps) {
	return (
		<Dialog
			onOpenChange={(open) => !open && onClose()}
			open={dialogState !== null}
		>
			<DialogContent className={`${appModalContentClass} max-w-2xl`}>
				<AppModalHeader
					category="Equipes"
					description="Vincule a equipe a uma loja e, se desejar, a um gerente de referência."
					icon={
						dialogState?.mode === 'edit' ? PencilLine : UsersRound
					}
					title={
						dialogState?.mode === 'edit'
							? 'Editar equipe'
							: 'Nova equipe'
					}
					tone="violet"
				/>
				<form
					className="flex min-h-0 flex-1 flex-col overflow-hidden"
					onSubmit={(event) => {
						event.preventDefault();
						onSave();
					}}
				>
					<AppModalBody className="grid gap-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-2">
								<Label htmlFor="team-name" required>
									Nome da equipe
								</Label>
								<Input
									id="team-name"
									onChange={(event) =>
										onStateChange((current) => ({
											...current,
											name: event.target.value,
										}))
									}
									value={formState.name}
									{...requiredFieldProps()}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="team-store" required>
									Loja
								</Label>
								<select
									className="h-11 rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground transition-colors outline-none focus:border-slate-400 focus:ring-2 focus:ring-ring"
									id="team-store"
									onChange={(event) =>
										onStateChange((current) => ({
											...current,
											storeId: event.target.value,
											memberUserIds:
												event.target.value ===
												current.storeId
													? current.memberUserIds
													: [],
										}))
									}
									value={formState.storeId}
									{...requiredFieldProps()}
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
							<Label htmlFor="team-manager">
								Gerente da equipe
							</Label>
							<select
								className="h-11 rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground transition-colors outline-none focus:border-slate-400 focus:ring-2 focus:ring-ring"
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
						<div className="grid gap-2">
							<Label>Membros</Label>
							<TeamMemberSelector
								candidates={memberCandidates}
								disabled={!formState.storeId || isPending}
								emptyLabel="Nenhum membro selecionado para esta equipe."
								isLoading={membersLoading}
								onChange={(memberUserIds) =>
									onStateChange((current) => ({
										...current,
										memberUserIds,
									}))
								}
								selectedUserIds={formState.memberUserIds}
							/>
						</div>
						<ModalFormErrorBanner message={dialogError} />
					</AppModalBody>
					<AppModalFooter>
						<AppModalCancelButton onClick={onClose} type="button">
							Cancelar
						</AppModalCancelButton>
						<AppModalPrimaryButton
							disabled={isPending}
							type="submit"
						>
							<Save className="size-4" />
							{isPending ? 'Salvando...' : 'Salvar equipe'}
						</AppModalPrimaryButton>
					</AppModalFooter>
				</form>
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
		<Dialog
			onOpenChange={(open) => !open && onClose()}
			open={target !== null}
		>
			<DialogContent className={`${appModalContentClass} max-w-lg`}>
				<AppModalHeader
					category="Equipes"
					description="Confirme a remoção da equipe selecionada."
					icon={Trash2}
					title="Excluir equipe"
					tone="danger"
				/>
				<AppModalBody>
					<div className="inline-flex items-center gap-2 rounded-full bg-[#2d3648]/10 px-3 py-1 text-xs font-medium text-[#2d3648]">
						<ShieldCheck className="size-3.5" />
						Equipe
					</div>
					<AppModalConfirmPanel icon={Trash2}>
						Equipe:{' '}
						<span className="font-medium">{target?.name}</span>
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
	initialMemberUserIds: string[];
};
