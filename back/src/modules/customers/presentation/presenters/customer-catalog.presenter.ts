import type { CustomerCatalogPage } from '../../domain/repositories/customer.repository.js';
import type { CustomerCatalogResponseDto } from '../../application/dto/customer-catalog-response.dto.js';
import { CustomerPresenter } from './customer.presenter.js';

class CustomerCatalogPresenter {
	static toResponse(page: CustomerCatalogPage): CustomerCatalogResponseDto {
		const items = page.items.map((item) => ({
			customer: CustomerPresenter.toResponse(item.customer),
			primaryStoreName: item.primaryStoreName,
			leadCount: item.leadCount,
			openDealsCount: item.openDealsCount,
			wonDealsCount: item.wonDealsCount,
			totalDealsCount: item.totalDealsCount,
			totalDealValue: item.totalDealValue,
			lastActivityAt: item.lastActivityAt?.toISOString() ?? null,
			lastActivityLabel: item.lastActivityLabel,
			status: item.status,
			source: item.source,
		}));

		return {
			items,
			summary: page.summary,
			origins: [...page.origins],
			locations: [...page.locations],
			highlights: page.highlights.map((item) => ({
				customer: CustomerPresenter.toResponse(item.customer),
				primaryStoreName: item.primaryStoreName,
				leadCount: item.leadCount,
				openDealsCount: item.openDealsCount,
				wonDealsCount: item.wonDealsCount,
				totalDealsCount: item.totalDealsCount,
				totalDealValue: item.totalDealValue,
				lastActivityAt: item.lastActivityAt?.toISOString() ?? null,
				lastActivityLabel: item.lastActivityLabel,
				status: item.status,
				source: item.source,
			})),
			page: page.page,
			limit: page.limit,
			total: page.total,
			totalPages: page.totalPages,
		};
	}
}

export { CustomerCatalogPresenter };
