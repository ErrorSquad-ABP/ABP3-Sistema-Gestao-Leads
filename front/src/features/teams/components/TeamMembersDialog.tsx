'use client';

import { AlertCircle, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import type {
	TeamMemberCandidate,
	TeamRecord,
} from '@/features/teams/model/teams.model';

import { getInitials, TeamMemberSelector } from './TeamMemberSelector';

type TeamMembersDialogProps = {
	candidates: TeamMemberCandidate[];
	error: string | null;
	isLoading?: boolean;
	isPending?: boolean;
	onAdd: (userId: string) => void;
	onClose: () => void;
	onRemove: (userId: string) => void;
	storeName: string;
	team: TeamRecord | null;
};

function TeamMembersDialog({
	candidates,
	error,
	isLoading = false,
	isPending = false,
	onAdd,
	onClose,
	onRemove,
	storeName,
	team,
}: TeamMembersDialogProps) {
	const memberUserIds = team?.memberUserIds ?? [];
	const memberById = new Map(
		candidates.map((candidate) => [candidate.id, candidate]),
	);
	const members = memberUserIds.map(
		(userId) =>
			memberById.get(userId) ?? {
				id: userId,
				name: `Usuário ${userId.slice(0, 8)}`,
				email: 'Dados indisponíveis',
			},
	);

	return (
		<Dialog onOpenChange={(open) => !open && onClose()} open={team !== null}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Membros da equipe</DialogTitle>
					<DialogDescription>
						{team?.name ?? 'Equipe'} · {storeName}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5 px-6 py-5">
					{error ? (
						<div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							<AlertCircle className="mt-0.5 size-4" />
							<p>{error}</p>
						</div>
					) : null}

					<div className="space-y-3">
						<div className="flex items-center justify-between gap-3">
							<h3 className="text-sm font-semibold text-foreground">
								Membros atuais
							</h3>
							<span className="text-xs text-muted-foreground">
								{memberUserIds.length} selecionados
							</span>
						</div>

						{isLoading ? (
							<div className="rounded-xl border border-[color:var(--table-border)] bg-[color:var(--table-row-alt)] px-3 py-4 text-sm text-muted-foreground">
								Carregando membros...
							</div>
						) : members.length === 0 ? (
							<div className="rounded-xl border border-dashed border-[color:var(--table-border)] bg-[color:var(--table-row-alt)] px-3 py-5 text-sm text-muted-foreground">
								Nenhum membro atribuído a esta equipe.
							</div>
						) : (
							<div className="max-h-64 space-y-2 overflow-y-auto pr-1">
								{members.map((member) => (
									<div
										className="flex items-center gap-3 rounded-xl border border-[color:var(--table-border)] bg-white px-3 py-2"
										key={member.id}
									>
										<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--kpi-surface-neutral)] text-xs font-bold text-[color:var(--kpi-icon-neutral)]">
											{getInitials(member.name)}
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-semibold text-foreground">
												{member.name}
											</p>
											<p className="truncate text-xs text-muted-foreground">
												{member.email}
											</p>
										</div>
										<Button
											className="rounded-lg"
											disabled={isPending}
											onClick={() => onRemove(member.id)}
											size="sm"
											type="button"
											variant="outline"
										>
											Remover
										</Button>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
							<UserPlus className="size-4 text-[color:var(--brand-accent)]" />
							Adicionar membro
						</div>
						<TeamMemberSelector
							candidates={candidates}
							disabled={isPending || team === null}
							emptyLabel="Todos os membros elegíveis já estão na equipe."
							isLoading={isLoading}
							onChange={(nextIds) => {
								const nextId = nextIds.find(
									(userId) => !memberUserIds.includes(userId),
								);
								if (nextId) {
									onAdd(nextId);
								}
							}}
							selectedUserIds={memberUserIds}
							showSelectedList={false}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button className="rounded-md" onClick={onClose} variant="outline">
						Fechar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { TeamMembersDialog };
