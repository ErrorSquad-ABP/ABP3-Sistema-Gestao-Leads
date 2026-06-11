'use client';

import { NegotiationsActions } from '@/features/deals/components/NegotiationsActions';
import { NegotiationsMetricsGrid } from '@/features/deals/components/NegotiationsMetricsGrid';
import { AppPageHeader } from '@/components/layout/AppPageHeader';

type Props = {
	search: string;
	onCreateDeal: () => void;
	onSearchChange: (value: string) => void;
};

function NegotiationsPageTop({ search, onCreateDeal, onSearchChange }: Props) {
	return (
		<section className="space-y-6">
			<AppPageHeader
				action={
					<NegotiationsActions
						search={search}
						onCreateDeal={onCreateDeal}
						onSearchChange={onSearchChange}
					/>
				}
				description="Gerencie seu funil e feche mais negócios."
				title="Negociações"
			/>

			<NegotiationsMetricsGrid />
		</section>
	);
}

export { NegotiationsPageTop };
