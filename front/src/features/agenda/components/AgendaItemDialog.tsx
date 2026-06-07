import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

import {
	AgendaItemForm,
	type AgendaItemFormMode,
	type AgendaItemFormValues,
} from './AgendaItemForm';
import type { AgendaItem } from '../model/agenda.model';
import type { AgendaLeadSummary } from '../model/agenda.model';

type Props = {
	errorMessage?: string | null;
	initialDate?: Date;
	initialLead?: AgendaLeadSummary | null;
	isSubmitting: boolean;
	item?: AgendaItem | null;
	mode: AgendaItemFormMode;
	onOpenChange: (open: boolean) => void;
	onSubmit: (payload: AgendaItemFormValues) => void;
	open: boolean;
};

function AgendaItemDialog({
	errorMessage = null,
	initialDate,
	initialLead = null,
	isSubmitting,
	item = null,
	mode,
	onOpenChange,
	onSubmit,
	open,
}: Props) {
	const title =
		mode === 'edit' ? 'Editar atividade' : 'Nova atividade da agenda';
	const description =
		mode === 'edit'
			? 'Atualize os dados da atividade mantendo a agenda organizada.'
			: 'Crie uma tarefa ou compromisso para o dia selecionado.';

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<div className="px-6 py-5">
					<AgendaItemForm
						initialDate={initialDate}
						initialLead={initialLead}
						isSubmitting={isSubmitting}
						item={item}
						mode={mode}
						onCancel={() => onOpenChange(false)}
						onSubmit={onSubmit}
					/>
					{errorMessage ? (
						<p className="mt-3 text-sm text-destructive" role="alert">
							{errorMessage}
						</p>
					) : null}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export { AgendaItemDialog };
