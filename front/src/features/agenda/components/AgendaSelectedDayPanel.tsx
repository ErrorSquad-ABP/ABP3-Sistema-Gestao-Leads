import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { AgendaEventList } from './AgendaEventList';
import type { AgendaItem } from '../model/agenda.model';

type Props = {
	dateLabel: string;
	items: readonly AgendaItem[];
	onCancel: (id: string) => void;
	onComplete: (id: string) => void;
	onCreateClick: () => void;
	onEdit: (item: AgendaItem) => void;
	onMove?: (item: AgendaItem) => void;
};

function AgendaSelectedDayPanel({
	dateLabel,
	items,
	onCancel,
	onComplete,
	onCreateClick,
	onEdit,
	onMove,
}: Props) {
	return (
		<Card className="rounded-lg border-border bg-card shadow-none">
			<CardHeader className="flex flex-row items-start justify-between gap-3">
				<div>
					<CardTitle className="text-base">Atividades do dia</CardTitle>
					<p className="mt-1 text-sm capitalize text-muted-foreground">
						{dateLabel}
					</p>
				</div>
				<Button onClick={onCreateClick} size="sm" variant="outline">
					<Plus className="size-4" />
					Criar
				</Button>
			</CardHeader>
			<CardContent>
				{items.length > 0 ? (
					<AgendaEventList
						items={items}
						onCancel={onCancel}
						onComplete={onComplete}
						onEdit={onEdit}
						onMove={onMove}
					/>
				) : (
					<div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
						Nenhuma atividade para este dia.
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export { AgendaSelectedDayPanel };
