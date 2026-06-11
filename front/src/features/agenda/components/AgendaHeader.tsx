import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import {
	AppPageHeader,
	appPageActionClass,
} from '@/components/layout/AppPageHeader';
import { Button } from '@/components/ui/button';

type Props = {
	isAdminView?: boolean;
	monthLabel: string;
	onCreateClick: () => void;
	onNextMonth: () => void;
	onPreviousMonth: () => void;
	onTodayClick: () => void;
};

function AgendaHeader({
	isAdminView = false,
	monthLabel,
	onCreateClick,
	onNextMonth,
	onPreviousMonth,
	onTodayClick,
}: Props) {
	return (
		<AppPageHeader
			action={
				<Button className={appPageActionClass} onClick={onCreateClick}>
					<Plus className="size-4" />
					Nova atividade
				</Button>
			}
			controls={
				<>
					<div
						className="flex h-12 w-full items-center justify-between gap-2 rounded-xl border border-[#d8e0ea] bg-white p-1 sm:w-auto"
						aria-label="Navegação de mês da agenda"
						role="group"
					>
						<Button
							aria-label="Mês anterior"
							onClick={onPreviousMonth}
							size="icon"
							variant="ghost"
						>
							<ChevronLeft className="size-4" />
						</Button>
						<p className="min-w-32 text-center text-sm font-semibold text-foreground capitalize">
							{monthLabel}
						</p>
						<Button
							aria-label="Próximo mês"
							onClick={onNextMonth}
							size="icon"
							variant="ghost"
						>
							<ChevronRight className="size-4" />
						</Button>
					</div>
					<Button onClick={onTodayClick} size="sm" variant="outline">
						Hoje
					</Button>
				</>
			}
			description={
				isAdminView
					? 'Agenda de todos os usuários.'
					: 'Meus compromissos e próximas atividades.'
			}
			title="Agenda"
		/>
	);
}

export { AgendaHeader };
