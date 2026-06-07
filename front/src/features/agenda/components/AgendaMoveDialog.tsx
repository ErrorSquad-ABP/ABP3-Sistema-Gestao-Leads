import { type FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Mover atividade</DialogTitle>
					<DialogDescription>
						Escolha a nova data. Horário e duração serão preservados.
					</DialogDescription>
				</DialogHeader>
				<form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
					<div className="space-y-2">
						<Label htmlFor="agenda-move-date">Nova data</Label>
						<Input
							id="agenda-move-date"
							onChange={(event) => setDate(event.target.value)}
							required
							type="date"
							value={date}
						/>
					</div>
					<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<Button
							disabled={isSubmitting}
							onClick={() => onOpenChange(false)}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button disabled={isSubmitting || !item} type="submit">
							Mover
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export { AgendaMoveDialog };
