import { queryKeys } from '@/src/lib/constants/query-keys';

import { customersService } from '../../customers/api/customers.service';
import { storesService } from '../../stores/api/stores.service';
import { usersService } from '../../users/api/users.service';
import { leadsService } from '../api/leads.service';

const leadsQueries = {
	detail(leadId: string) {
		return {
			queryKey: queryKeys.leads.detail(leadId),
			queryFn: () => leadsService.findById(leadId),
		};
	},
	formDependencies() {
		return {
			queryKey: queryKeys.leads.formDependencies,
			queryFn: async () => {
				const [customers, stores, usersPage] = await Promise.all([
					customersService.list(),
					storesService.list(),
					usersService.list({ page: 1, limit: 100 }),
				]);

				return {
					customers,
					stores,
					owners: usersPage.items,
				};
			},
		};
	},
	owner(ownerUserId: string) {
		return {
			queryKey: queryKeys.leads.owner(ownerUserId),
			queryFn: () => leadsService.listByOwner(ownerUserId),
		};
	},
	team(teamId: string) {
		return {
			queryKey: queryKeys.leads.team(teamId),
			queryFn: () => leadsService.listByTeam(teamId),
		};
	},
};

export { leadsQueries };
