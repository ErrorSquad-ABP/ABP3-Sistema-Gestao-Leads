'use client';

import type { Deal, DealStatus } from '@/features/deals/model/deals.model';
import { NegotiationsActions } from '@/features/deals/components/NegotiationsActions';
import { NegotiationsHeader } from '@/features/deals/components/NegotiationsHeader';
import { NegotiationsMetricsGrid } from '@/features/deals/components/NegotiationsMetricsGrid';

type Props = {
	search: string;
	onSearchChange: (value: string) => void;
	statusFilter: 'ALL' | DealStatus;
	onStatusFilterChange: (value: 'ALL' | DealStatus) => void;
	deals: Deal[];
};

function NegotiationsPageTop({
	search,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
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
					onSearchChange={onSearchChange}
					statusFilter={statusFilter}
					onStatusFilterChange={onStatusFilterChange}
				/>
			</div>

			<NegotiationsMetricsGrid deals={deals} />
		</section>
	);
}

export { NegotiationsPageTop };
