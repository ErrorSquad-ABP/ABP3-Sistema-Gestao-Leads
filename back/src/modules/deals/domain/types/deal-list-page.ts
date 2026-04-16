import type { Deal } from '../entities/deal.entity.js';

type DealListPagination = {
	readonly page: number;
	readonly limit: number;
};

type DealListPage = {
	readonly items: readonly Deal[];
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

export type { DealListPage, DealListPagination };
export { computeTotalPages };
