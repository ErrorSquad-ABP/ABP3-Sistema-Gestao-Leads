'use client';

import { Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
	search: string;
	onCreateDeal: () => void;
	onSearchChange: (value: string) => void;
};

function NegotiationsActions({ search, onCreateDeal, onSearchChange }: Props) {
	return (
		<div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end xl:w-auto">
			<div className="relative w-full sm:w-[440px]">
				<Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Buscar por título, lead, cliente ou veículo..."
					className="h-12 rounded-xl border-border bg-white pl-11 shadow-none focus-visible:border-[color:var(--brand-accent)]/35 focus-visible:ring-0"
				/>
			</div>

			<Button
				className="h-12 shrink-0 rounded-xl bg-[color:var(--brand-accent)] px-5 font-semibold text-white shadow-none hover:bg-[color:var(--brand-accent-hover)]"
				onClick={onCreateDeal}
				type="button"
			>
				<Plus className="size-4" />
				Nova negociação
			</Button>
		</div>
	);
}

export { NegotiationsActions };
