import { CalendarPlus, PencilLine } from 'lucide-react';

import {
	AppModalBody,
	AppModalHeader,
	appModalContentClass,
} from '@/components/modals/AppModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
			<DialogContent className={`${appModalContentClass} max-w-2xl`}>
				<AppModalHeader
					category="Agenda"
					description={description}
					icon={mode === 'edit' ? PencilLine : CalendarPlus}
					title={title}
				/>
				<AppModalBody>
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
						<p
							className="mt-3 text-sm text-destructive"
							role="alert"
						>
							{errorMessage}
						</p>
					) : null}
				</AppModalBody>
			</DialogContent>
		</Dialog>
	);
}

export { AgendaItemDialog };
