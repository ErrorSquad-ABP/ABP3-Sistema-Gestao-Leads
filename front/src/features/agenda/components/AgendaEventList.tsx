import type { AgendaItem } from '../model/agenda.model';
import { AgendaEventCard } from './AgendaEventCard';

type Props = {
	items: readonly AgendaItem[];
	onCancel: (id: string) => void;
	onComplete: (id: string) => void;
};

function AgendaEventList({ items, onCancel, onComplete }: Props) {
	return (
		<ul className="space-y-3" aria-label="Próximas atividades">
			{items.map((item) => (
				<li key={item.id}>
					<AgendaEventCard
						item={item}
						onCancel={onCancel}
						onComplete={onComplete}
					/>
				</li>
			))}
		</ul>
	);
}

export { AgendaEventList };
