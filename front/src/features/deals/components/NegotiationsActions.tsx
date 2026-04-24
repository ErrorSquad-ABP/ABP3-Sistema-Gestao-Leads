'use client';

import { Bell, Plus, Search, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { DealStatus } from '@/features/deals/model/deals.model';

type Props = {
	search: string;
	onSearchChange: (value: string) => void;
	statusFilter: 'ALL' | DealStatus;
	onStatusFilterChange: (value: 'ALL' | DealStatus) => void;
	notificationCount?: number;
};

function NegotiationsActions({
	search,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
	notificationCount = 3,
}: Props) {
	return (
		<div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
			<div className="relative w-full sm:w-[420px]">
				<Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Buscar por título, lead, cliente ou veículo..."
					className="h-11 rounded-xl border-border bg-white pl-11 shadow-none focus-visible:ring-0 focus-visible:border-[color:var(--brand-accent)]/35"
				/>
			</div>

			<div className="flex items-center gap-2">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="icon-lg"
							className="rounded-xl bg-white shadow-none"
							aria-label="Filtrar"
						>
							<SlidersHorizontal className="size-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-56 rounded-2xl border-border bg-white"
					>
						<DropdownMenuItem
							className={cn(
								'cursor-pointer rounded-xl px-3 py-2 text-sm',
								statusFilter === 'ALL'
									? 'text-[color:var(--brand-accent)]'
									: '',
							)}
							onSelect={() => onStatusFilterChange('ALL')}
						>
							Todos os status
						</DropdownMenuItem>
						<DropdownMenuItem
							className={cn(
								'cursor-pointer rounded-xl px-3 py-2 text-sm',
								statusFilter === 'OPEN'
									? 'text-[color:var(--brand-accent)]'
									: '',
							)}
							onSelect={() => onStatusFilterChange('OPEN')}
						>
							Abertas
						</DropdownMenuItem>
						<DropdownMenuItem
							className={cn(
								'cursor-pointer rounded-xl px-3 py-2 text-sm',
								statusFilter === 'WON'
									? 'text-[color:var(--brand-accent)]'
									: '',
							)}
							onSelect={() => onStatusFilterChange('WON')}
						>
							Ganhas
						</DropdownMenuItem>
						<DropdownMenuItem
							className={cn(
								'cursor-pointer rounded-xl px-3 py-2 text-sm',
								statusFilter === 'LOST'
									? 'text-[color:var(--brand-accent)]'
									: '',
							)}
							onSelect={() => onStatusFilterChange('LOST')}
						>
							Perdidas
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<Button
					className="h-11 rounded-xl bg-[color:var(--brand-accent)] px-4 text-white shadow-none hover:bg-[color:var(--brand-accent)]/90"
					type="button"
				>
					<Plus className="size-4" />
					Nova negociação
				</Button>

				<button
					type="button"
					className="relative inline-flex size-11 items-center justify-center rounded-xl border border-transparent bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
					aria-label="Notificações"
				>
					<Bell className="size-5" />
					<span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[color:var(--brand-accent)] text-[0.7rem] font-semibold leading-none text-white">
						{notificationCount}
					</span>
				</button>
			</div>
		</div>
	);
}

export { NegotiationsActions };
