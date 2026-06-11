import { type FormEvent, useState } from 'react';
import { CalendarClock, MoveRight } from 'lucide-react';

import {
	AppModalBody,
	AppModalCancelButton,
	AppModalFooter,
	AppModalHeader,
	AppModalPrimaryButton,
	AppModalSection,
	appModalContentClass,
} from '@/components/modals/AppModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label, requiredFieldProps } from '@/components/ui/label';

import type { AgendaItem } from '../model/agenda.model';
import { agendaDateKey, moveAgendaItemToDate } from '../lib/agenda-formatters';

type Props = {
	isSubmitting: boolean;
	item: AgendaItem | null;
	onMove: (
		item: AgendaItem,
		payload: ReturnType<typeof moveAgendaItemToDate>,
	) => void;
	onOpenChange: (open: boolean) => void;
	open: boolean;
};

function AgendaMoveDialog({
	isSubmitting,
	item,
	onMove,
	onOpenChange,
	open,
}: Props) {
	const [date, setDate] = useState(() => agendaDateKey(new Date()));

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!item || !date) {
			return;
		}
		const [year, month, day] = date.split('-').map(Number);
		const targetDate = new Date(year, month - 1, day);
		onMove(item, moveAgendaItemToDate(item, targetDate));
	}

	return (
		<Dialog
			onOpenChange={(nextOpen) => {
				if (nextOpen) {
					setDate(agendaDateKey(new Date()));
				}
				onOpenChange(nextOpen);
			}}
			open={open}
		>
			<DialogContent className={`${appModalContentClass} max-w-xl`}>
				<AppModalHeader
					category="Agenda"
					description="Escolha a nova data. Horário e duração serão preservados."
					icon={CalendarClock}
					title="Mover atividade"
					tone="info"
				/>
				<form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
					<AppModalBody>
						<AppModalSection icon={MoveRight} title="Nova data" tone="info">
							<div className="space-y-2">
								<Label htmlFor="agenda-move-date" required>
									Nova data
								</Label>
								<Input
									id="agenda-move-date"
									onChange={(event) => setDate(event.target.value)}
									required
									type="date"
									value={date}
									{...requiredFieldProps()}
								/>
							</div>
						</AppModalSection>
					</AppModalBody>
					<AppModalFooter>
						<AppModalCancelButton
							disabled={isSubmitting}
							onClick={() => onOpenChange(false)}
							type="button"
						>
							Cancelar
						</AppModalCancelButton>
						<AppModalPrimaryButton
							disabled={isSubmitting || !item}
							type="submit"
						>
							<MoveRight className="size-4" />
							Mover
						</AppModalPrimaryButton>
					</AppModalFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export { AgendaMoveDialog };
