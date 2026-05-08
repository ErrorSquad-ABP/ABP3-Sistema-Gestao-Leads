'use client';

import type { Deal } from '@/features/deals/model/deals.model';
import { NegotiationsActions } from '@/features/deals/components/NegotiationsActions';
import { NegotiationsHeader } from '@/features/deals/components/NegotiationsHeader';
import { NegotiationsMetricsGrid } from '@/features/deals/components/NegotiationsMetricsGrid';

type Props = {
	search: string;
	onCreateDeal: () => void;
	onSearchChange: (value: string) => void;
	deals: Deal[];
};

function NegotiationsPageTop({
	search,
	onCreateDeal,
	onSearchChange,
	deals,
}: Props) {
	return (
		<section className="space-y-6">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div className="min-w-0 shrink-0">
					<NegotiationsHeader />
				</div>
				<NegotiationsActions
					search={search}
					onCreateDeal={onCreateDeal}
					onSearchChange={onSearchChange}
				/>
			</div>

			<NegotiationsMetricsGrid deals={deals} />
		</section>
	);
}

export { NegotiationsPageTop };
