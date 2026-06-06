import type { AgendaItem } from '../model/agenda.model';
import { AgendaEventCard } from './AgendaEventCard';

type Props = {
	items: readonly AgendaItem[];
	onCancel: (id: string) => void;
	onComplete: (id: string) => void;
	onEdit: (item: AgendaItem) => void;
	onMove?: (item: AgendaItem) => void;
};

function AgendaEventList({
	items,
	onCancel,
	onComplete,
	onEdit,
	onMove,
}: Props) {
	return (
		<ul className="space-y-3" aria-label="Próximas atividades">
			{items.map((item) => (
				<li key={item.id}>
					<AgendaEventCard
						item={item}
						onCancel={onCancel}
						onComplete={onComplete}
						onEdit={onEdit}
						onMove={onMove}
					/>
				</li>
			))}
		</ul>
	);
}

export { AgendaEventList };
