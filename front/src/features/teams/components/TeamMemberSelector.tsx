'use client';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { TeamMemberCandidate } from '@/features/teams/model/teams.model';

type TeamMemberSelectorProps = {
	candidates: TeamMemberCandidate[];
	disabled?: boolean;
	emptyLabel?: string;
	isLoading?: boolean;
	onChange: (memberUserIds: string[]) => void;
	selectedUserIds: string[];
	showSelectedList?: boolean;
};

function getInitials(value: string) {
	const initials = value
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
	return initials || 'US';
}

function TeamMemberSelector({
	candidates,
	disabled = false,
	emptyLabel = 'Nenhum membro selecionado.',
	isLoading = false,
	onChange,
	selectedUserIds,
	showSelectedList = true,
}: TeamMemberSelectorProps) {
	const selectedSet = new Set(selectedUserIds);
	const selectedMembers = selectedUserIds.map(
		(userId) =>
			candidates.find((candidate) => candidate.id === userId) ?? {
				id: userId,
				name: `Usuário ${userId.slice(0, 8)}`,
				email: 'Dados indisponíveis',
			},
	);
	const availableCandidates = candidates.filter(
		(candidate) => !selectedSet.has(candidate.id),
	);

	function addMember(userId: string) {
		if (!userId || selectedSet.has(userId)) {
			return;
		}
		onChange([...selectedUserIds, userId]);
	}

	function removeMember(userId: string) {
		onChange(selectedUserIds.filter((id) => id !== userId));
	}

	return (
		<div className="space-y-3">
			<div className="flex gap-2">
				<select
					className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
					disabled={disabled || isLoading || availableCandidates.length === 0}
					onChange={(event) => {
						addMember(event.target.value);
						event.target.value = '';
					}}
					value=""
				>
					<option value="">
						{isLoading
							? 'Carregando membros...'
							: availableCandidates.length === 0
								? 'Nenhum membro elegível'
								: 'Adicionar membro'}
					</option>
					{availableCandidates.map((candidate) => (
						<option key={candidate.id} value={candidate.id}>
							{candidate.name} · {candidate.email}
						</option>
					))}
				</select>
			</div>

			{!showSelectedList ? null : selectedMembers.length === 0 ? (
				<div className="rounded-xl border border-[color:var(--table-border)] bg-[color:var(--table-row-alt)] px-3 py-3 text-sm text-muted-foreground">
					{emptyLabel}
				</div>
			) : (
				<div className="space-y-2">
					{selectedMembers.map((member) => (
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
								aria-label={`Remover ${member.name}`}
								className="size-8 rounded-lg"
								disabled={disabled}
								onClick={() => removeMember(member.id)}
								size="icon"
								type="button"
								variant="ghost"
							>
								<X className="size-4" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export { TeamMemberSelector, getInitials };
