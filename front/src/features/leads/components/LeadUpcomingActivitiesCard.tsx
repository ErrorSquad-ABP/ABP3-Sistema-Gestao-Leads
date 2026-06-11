'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgendaConfirmDeleteDialog } from '@/features/agenda/components/AgendaConfirmDeleteDialog';
import { AgendaEventList } from '@/features/agenda/components/AgendaEventList';
import { AgendaItemDialog } from '@/features/agenda/components/AgendaItemDialog';
import type { AgendaItemFormValues } from '@/features/agenda/components/AgendaItemForm';
import {
	useCancelAgendaItemMutation,
	useCompleteAgendaItemMutation,
	useCreateAgendaItemMutation,
	useDeleteAgendaItemMutation,
	useLeadAgendaItemsQuery,
	useUpdateAgendaItemMutation,
} from '@/features/agenda/hooks/agenda.queries';
import type {
	AgendaItem,
	AgendaLeadSummary,
	CreateAgendaItemPayload,
} from '@/features/agenda/model/agenda.model';
import { appRoutes } from '@/lib/routes/app-routes';

type DialogState =
	| { mode: 'closed' }
	| { date: Date; mode: 'create' }
	| { item: AgendaItem; mode: 'edit' };

type Props = {
	customerName: string;
	leadId: string;
	leadStatus: string;
};

function LeadUpcomingActivitiesCard({
	customerName,
	leadId,
	leadStatus,
}: Props) {
	const [dialogState, setDialogState] = useState<DialogState>({
		mode: 'closed',
	});
	const [deleteTarget, setDeleteTarget] = useState<AgendaItem | null>(null);
	const leadAgenda = useLeadAgendaItemsQuery(leadId);
	const createAgendaItem = useCreateAgendaItemMutation();
	const updateAgendaItem = useUpdateAgendaItemMutation();
	const completeAgendaItem = useCompleteAgendaItemMutation();
	const cancelAgendaItem = useCancelAgendaItemMutation();
	const deleteAgendaItem = useDeleteAgendaItemMutation();
	const initialLead: AgendaLeadSummary = {
		id: leadId,
		customerName,
		status: leadStatus,
	};

	function closeDialog() {
		createAgendaItem.reset();
		updateAgendaItem.reset();
		setDialogState({ mode: 'closed' });
	}

	function handleSubmit(payload: AgendaItemFormValues) {
		if (dialogState.mode === 'edit') {
			updateAgendaItem.mutate(
				{ id: dialogState.item.id, payload },
				{ onSuccess: closeDialog },
			);
			return;
		}
		const createPayload: CreateAgendaItemPayload = { ...payload, leadId };
		createAgendaItem.mutate(createPayload, {
			onSuccess: closeDialog,
		});
	}

	function closeDeleteDialog() {
		deleteAgendaItem.reset();
		setDeleteTarget(null);
	}

	async function handleDeleteConfirm() {
		if (!deleteTarget) {
			return;
		}
		await deleteAgendaItem.mutateAsync(deleteTarget.id);
		if (
			dialogState.mode === 'edit' &&
			dialogState.item.id === deleteTarget.id
		) {
			closeDialog();
		}
		closeDeleteDialog();
	}

	return (
		<Card className="rounded-[1.75rem] border-border/90 bg-white">
			<CardHeader className="flex flex-row items-start justify-between gap-3">
				<div>
					<p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
						Agenda
					</p>
					<CardTitle>Próximas atividades</CardTitle>
				</div>
				<div className="flex flex-wrap justify-end gap-2">
					<Button
						className="rounded-md shadow-none"
						onClick={() => setDialogState({ mode: 'create', date: new Date() })}
						type="button"
					>
						Nova atividade
					</Button>
					<Button asChild className="rounded-md shadow-none" variant="outline">
						<Link href={appRoutes.app.agenda}>Ver na agenda</Link>
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<AgendaItemDialog
					errorMessage={
						createAgendaItem.isError || updateAgendaItem.isError
							? 'Não foi possível salvar a atividade.'
							: null
					}
					initialDate={
						dialogState.mode === 'create' ? dialogState.date : new Date()
					}
					initialLead={initialLead}
					isSubmitting={
						createAgendaItem.isPending || updateAgendaItem.isPending
					}
					item={dialogState.mode === 'edit' ? dialogState.item : null}
					mode={dialogState.mode === 'edit' ? 'edit' : 'create'}
					onOpenChange={(open) => {
						if (!open) {
							closeDialog();
						}
					}}
					onSubmit={handleSubmit}
					onDelete={
						dialogState.mode === 'edit'
							? () => setDeleteTarget(dialogState.item)
							: undefined
					}
					open={dialogState.mode !== 'closed'}
				/>
				<AgendaConfirmDeleteDialog
					error={
						deleteAgendaItem.isError
							? 'Não foi possível excluir a atividade.'
							: null
					}
					isPending={deleteAgendaItem.isPending}
					itemTitle={deleteTarget?.title ?? 'atividade'}
					onClose={closeDeleteDialog}
					onConfirm={handleDeleteConfirm}
					open={deleteTarget !== null}
				/>
				{leadAgenda.isPending ? (
					<div className="h-24 animate-pulse rounded-lg border border-border bg-muted/50" />
				) : null}
				{leadAgenda.isError ? (
					<div className="rounded-lg border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
						Não foi possível carregar as atividades deste lead.
					</div>
				) : null}
				{leadAgenda.data && leadAgenda.data.items.length > 0 ? (
					<AgendaEventList
						items={leadAgenda.data.items}
						onCancel={(id) => cancelAgendaItem.mutate(id)}
						onComplete={(id) => completeAgendaItem.mutate(id)}
						onDelete={setDeleteTarget}
						onEdit={(item) => setDialogState({ mode: 'edit', item })}
					/>
				) : null}
				{leadAgenda.data && leadAgenda.data.items.length === 0 ? (
					<div className="rounded-2xl border border-border/80 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
						Nenhuma atividade agendada para este lead.
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}

export { LeadUpcomingActivitiesCard };
