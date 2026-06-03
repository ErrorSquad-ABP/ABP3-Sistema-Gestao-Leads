import { type FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import type {
	AgendaItemType,
	AgendaRecurrence,
	CreateAgendaItemPayload,
} from '../model/agenda.model';

type Props = {
	initialDate?: Date;
	isSubmitting: boolean;
	onCancel: () => void;
	onSubmit: (payload: CreateAgendaItemPayload) => void;
};

const RECURRENCE_OPTIONS: readonly {
	label: string;
	value: AgendaRecurrence;
}[] = [
	{ label: 'Não se repete', value: 'NONE' },
	{ label: 'Diária', value: 'DAILY' },
	{ label: 'Semanal', value: 'WEEKLY' },
	{ label: 'Mensal', value: 'MONTHLY' },
];

function localDateTimeToIso(value: string) {
	if (!value) {
		return null;
	}
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toDateTimeLocalValue(date: Date, hour: number) {
	const next = new Date(date);
	next.setHours(hour, 0, 0, 0);
	const year = next.getFullYear();
	const month = String(next.getMonth() + 1).padStart(2, '0');
	const day = String(next.getDate()).padStart(2, '0');
	const hours = String(next.getHours()).padStart(2, '0');
	const minutes = String(next.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function AgendaCreateForm({
	initialDate = new Date(),
	isSubmitting,
	onCancel,
	onSubmit,
}: Props) {
	const [type, setType] = useState<AgendaItemType>('TASK');
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [location, setLocation] = useState('');
	const [startsAt, setStartsAt] = useState(() =>
		toDateTimeLocalValue(initialDate, 9),
	);
	const [endsAt, setEndsAt] = useState(() =>
		toDateTimeLocalValue(initialDate, 10),
	);
	const [dueAt, setDueAt] = useState(() =>
		toDateTimeLocalValue(initialDate, 9),
	);
	const [recurrence, setRecurrence] = useState<AgendaRecurrence>('NONE');
	const [error, setError] = useState<string | null>(null);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const normalizedTitle = title.trim();
		if (!normalizedTitle) {
			setError('Informe um título.');
			return;
		}
		if (type === 'EVENT' && !startsAt) {
			setError('Informe o início do compromisso.');
			return;
		}
		setError(null);
		onSubmit({
			type,
			title: normalizedTitle,
			description: description.trim() || null,
			location: location.trim() || null,
			recurrence,
			startsAt: type === 'EVENT' ? localDateTimeToIso(startsAt) : null,
			endsAt: type === 'EVENT' ? localDateTimeToIso(endsAt) : null,
			dueAt: type === 'TASK' ? localDateTimeToIso(dueAt) : null,
		});
	}

	return (
		<Card className="rounded-lg border-border bg-card shadow-none">
			<CardHeader>
				<CardTitle className="text-base">Novo item da agenda</CardTitle>
			</CardHeader>
			<CardContent>
				<form className="grid gap-4" onSubmit={handleSubmit}>
					<div className="grid gap-2 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="agenda-type">Tipo</Label>
							<select
								className="h-10 rounded-md border border-input bg-background px-3 text-sm"
								id="agenda-type"
								onChange={(event) =>
									setType(event.target.value as AgendaItemType)
								}
								value={type}
							>
								<option value="TASK">Tarefa</option>
								<option value="EVENT">Compromisso</option>
							</select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="agenda-recurrence">Repetição</Label>
							<select
								className="h-10 rounded-md border border-input bg-background px-3 text-sm"
								id="agenda-recurrence"
								onChange={(event) =>
									setRecurrence(event.target.value as AgendaRecurrence)
								}
								value={recurrence}
							>
								{RECURRENCE_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="agenda-title">Título</Label>
						<Input
							id="agenda-title"
							maxLength={120}
							onChange={(event) => setTitle(event.target.value)}
							required
							value={title}
						/>
					</div>

					<div className="grid gap-2 sm:grid-cols-2">
						{type === 'EVENT' ? (
							<>
								<div className="space-y-2">
									<Label htmlFor="agenda-starts-at">Início</Label>
									<Input
										id="agenda-starts-at"
										onChange={(event) => setStartsAt(event.target.value)}
										required
										type="datetime-local"
										value={startsAt}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="agenda-ends-at">Fim</Label>
									<Input
										id="agenda-ends-at"
										onChange={(event) => setEndsAt(event.target.value)}
										type="datetime-local"
										value={endsAt}
									/>
								</div>
							</>
						) : (
							<div className="space-y-2">
								<Label htmlFor="agenda-due-at">Prazo</Label>
								<Input
									id="agenda-due-at"
									onChange={(event) => setDueAt(event.target.value)}
									type="datetime-local"
									value={dueAt}
								/>
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="agenda-location">Local</Label>
							<Input
								id="agenda-location"
								maxLength={160}
								onChange={(event) => setLocation(event.target.value)}
								value={location}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="agenda-description">Descrição</Label>
						<Textarea
							id="agenda-description"
							maxLength={2000}
							onChange={(event) => setDescription(event.target.value)}
							value={description}
						/>
					</div>

					{error ? (
						<p className="text-sm text-destructive" role="alert">
							{error}
						</p>
					) : null}

					<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<Button
							disabled={isSubmitting}
							onClick={onCancel}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button disabled={isSubmitting} type="submit">
							Salvar
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

export { AgendaCreateForm };
