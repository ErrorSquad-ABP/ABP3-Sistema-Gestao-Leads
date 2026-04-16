import type { Lead } from '../entities/lead.entity.js';

type LeadListPagination = {
	readonly page: number;
	readonly limit: number;
};

type LeadListPage = {
	readonly items: readonly Lead[];
	readonly page: number;
	readonly limit: number;
	readonly total: number;
	readonly totalPages: number;
};

function computeTotalPages(total: number, limit: number): number {
	if (total === 0) {
		return 0;
	}
	return Math.ceil(total / limit);
}

export type { LeadListPage, LeadListPagination };
export { computeTotalPages };
