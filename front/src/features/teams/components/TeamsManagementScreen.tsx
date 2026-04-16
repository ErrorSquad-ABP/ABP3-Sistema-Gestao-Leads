'use client';

import { Plus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeadOwnersQuery } from '@/features/leads/hooks/leads.catalog.queries';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { useStoresQuery } from '@/features/stores/hooks/stores.queries';
import {
	useAssignTeamManagerMutation,
	useCreateTeamMutation,
	useDeleteTeamMutation,
	useUpdateTeamMutation,
} from '@/features/teams/hooks/teams.mutations';
import { useTeamsQuery } from '@/features/teams/hooks/teams.queries';
import type { TeamRecord } from '@/features/teams/model/teams.model';
import { isApiError } from '@/lib/http/api-error';
import {
	emptyTeamForm,
	TeamDeleteDialog,
	TeamFormDialog,
	toTeamPayload,
	type TeamDialogState,
	type TeamFormState,
} from './TeamForm';
import { TeamsTable } from './TeamsTable';

type TeamsManagementScreenProps = {
	user: AuthenticatedUser;
};

function getTeamsErrorMessage(error: unknown) {
	if (!isApiError(error)) {
		return 'Não foi possível concluir a operação agora.';
	}
	return error.message;
}

function TeamsManagementScreen({ user: _user }: TeamsManagementScreenProps) {
	const storesQuery = useStoresQuery();
	const teamsQuery = useTeamsQuery();
	const ownersQuery = useLeadOwnersQuery();

	const createTeamMutation = useCreateTeamMutation();
	const assignTeamManagerMutation = useAssignTeamManagerMutation();
	const updateTeamMutation = useUpdateTeamMutation();
	const deleteTeamMutation = useDeleteTeamMutation();

	const [teamDialogState, setTeamDialogState] =
		useState<TeamDialogState | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<TeamRecord | null>(null);
	const [teamFormState, setTeamFormState] =
		useState<TeamFormState>(emptyTeamForm);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const stores = useMemo(() => storesQuery.data ?? [], [storesQuery.data]);
	const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);
	const owners = useMemo(() => ownersQuery.data ?? [], [ownersQuery.data]);
	const storeLabelById = useMemo(
		() => Object.fromEntries(stores.map((store) => [store.id, store.name])),
		[stores],
	);
	const ownerLabelById = useMemo(
		() =>
			Object.fromEntries(
				owners.map((owner) => [owner.id, `${owner.name} · ${owner.email}`]),
			),
		[owners],
	);

	function openCreateTeamDialog() {
		setDialogError(null);
		setTeamFormState({
			...emptyTeamForm,
			storeId: stores[0]?.id ?? '',
		});
		setTeamDialogState({ mode: 'create', team: null });
	}

	function openEditTeamDialog(team: TeamRecord) {
		setDialogError(null);
		setTeamFormState({
			name: team.name,
			storeId: team.storeId,
			managerId: team.managerId ?? '',
		});
		setTeamDialogState({ mode: 'edit', team });
	}

	async function handleTeamSubmit() {
		const payload = toTeamPayload(teamFormState);
		if (!payload) {
			setDialogError('Informe nome e loja da equipe.');
			return;
		}

		setDialogError(null);
		try {
			if (teamDialogState?.mode === 'edit' && teamDialogState.team) {
				await updateTeamMutation.mutateAsync({
					id: teamDialogState.team.id,
					body: {
						name: payload.name,
						storeId: payload.storeId,
					},
				});
				const nextManagerId = payload.managerId;
				if (nextManagerId !== (teamDialogState.team.managerId ?? null)) {
					await assignTeamManagerMutation.mutateAsync({
						id: teamDialogState.team.id,
						managerId: nextManagerId,
					});
				}
			} else {
				await createTeamMutation.mutateAsync({
					name: payload.name,
					storeId: payload.storeId,
					managerId: payload.managerId,
				});
			}

			setTeamDialogState(null);
			setTeamFormState(emptyTeamForm);
		} catch (error) {
			setDialogError(getTeamsErrorMessage(error));
		}
	}

	async function handleDeleteConfirm() {
		if (!deleteTarget) {
			return;
		}

		setDeleteError(null);
		try {
			await deleteTeamMutation.mutateAsync(deleteTarget.id);
			setDeleteTarget(null);
		} catch (error) {
			setDeleteError(getTeamsErrorMessage(error));
		}
	}

	return (
		<div className="space-y-6">
			<Card className="overflow-hidden rounded-[1.75rem] border-border/90 bg-white">
				<CardHeader className="gap-5 border-none pb-6">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-3">
							<div className="flex size-12 items-center justify-center rounded-2xl border border-[#d96c3f]/16 bg-[#d96c3f]/10 text-[#d96c3f]">
								<Users className="size-5" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
									Workspace
								</p>
								<CardTitle className="text-[1.9rem] font-semibold tracking-tight">
									Equipes
								</CardTitle>
								<p className="max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
									Organize as equipes por loja, gerente e composição operacional
									sem misturar este contexto com outras entidades.
								</p>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					<Card className="rounded-[1.5rem] border-border/85 bg-white">
						<CardHeader className="gap-4">
							<div className="space-y-2">
								<div className="flex size-11 items-center justify-center rounded-2xl border border-[#d96c3f]/16 bg-[#d96c3f]/10 text-[#d96c3f]">
									<Users className="size-5" />
								</div>
								<CardTitle className="text-[1.4rem]">
									Cadastro de equipes
								</CardTitle>
								<p className="text-[0.95rem] leading-7 text-muted-foreground">
									Defina loja, gerente e estrutura visível de cada equipe do
									CRM.
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									className="rounded-md bg-[#2D3648] shadow-none hover:bg-[#232B3B]"
									disabled={stores.length === 0}
									onClick={openCreateTeamDialog}
									size="sm"
								>
									<Plus className="size-4" />
									Nova equipe
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-4 pt-0">
							{teamsQuery.isLoading ||
							ownersQuery.isLoading ||
							storesQuery.isLoading ? (
								<div className="rounded-2xl border border-border/80 bg-muted/20 px-4 py-8 text-sm text-muted-foreground">
									Carregando equipes...
								</div>
							) : teamsQuery.isError ? (
								<div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
									{getTeamsErrorMessage(teamsQuery.error)}
								</div>
							) : ownersQuery.isError ? (
								<div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
									{getTeamsErrorMessage(ownersQuery.error)}
								</div>
							) : storesQuery.isError ? (
								<div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
									{getTeamsErrorMessage(storesQuery.error)}
								</div>
							) : (
								<TeamsTable
									onDelete={(team) => {
										setDeleteError(null);
										setDeleteTarget(team);
									}}
									onEdit={openEditTeamDialog}
									ownerLabelById={ownerLabelById}
									storeLabelById={storeLabelById}
									teams={teams}
								/>
							)}
						</CardContent>
					</Card>
				</CardContent>
			</Card>

			<TeamFormDialog
				dialogError={dialogError}
				dialogState={teamDialogState}
				formState={teamFormState}
				isPending={
					createTeamMutation.isPending ||
					updateTeamMutation.isPending ||
					assignTeamManagerMutation.isPending
				}
				onClose={() => {
					setTeamDialogState(null);
					setDialogError(null);
				}}
				onSave={() => {
					void handleTeamSubmit();
				}}
				onStateChange={setTeamFormState}
				owners={owners}
				stores={stores}
			/>

			<TeamDeleteDialog
				deleteError={deleteError}
				isPending={deleteTeamMutation.isPending}
				onClose={() => {
					setDeleteTarget(null);
					setDeleteError(null);
				}}
				onConfirm={() => {
					void handleDeleteConfirm();
				}}
				target={deleteTarget}
			/>
		</div>
	);
}

export { TeamsManagementScreen };
