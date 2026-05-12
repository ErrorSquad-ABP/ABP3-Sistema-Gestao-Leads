import type { UUID } from '../../../../shared/domain/types/identifiers.js';

import type { Customer } from '../entities/customer.entity.js';

type CustomerCatalogStatus = 'ACTIVE' | 'INACTIVE';

type CustomerCatalogSort = 'recent' | 'deals_desc' | 'value_desc' | 'name_asc';

type CustomerCatalogFilters = {
	readonly search?: string;
	readonly storeId?: UUID;
	readonly status?: CustomerCatalogStatus;
	readonly sort?: CustomerCatalogSort;
};

type CustomerCatalogItem = {
	readonly customer: Customer;
	readonly primaryStoreName: string | null;
	readonly leadCount: number;
	readonly openDealsCount: number;
	readonly wonDealsCount: number;
	readonly totalDealsCount: number;
	readonly totalDealValue: string;
	readonly lastActivityAt: Date | null;
	readonly lastActivityLabel: string;
	readonly status: CustomerCatalogStatus;
	readonly source: string | null;
};

type CustomerCatalogSummary = {
	readonly total: number;
	readonly withDeals: number;
	readonly active: number;
	readonly retentionRate: number;
};

type CustomerCatalogBreakdownItem = {
	readonly label: string;
	readonly count: number;
};

type CustomerCatalogPage = {
	readonly items: readonly CustomerCatalogItem[];
	readonly summary: CustomerCatalogSummary;
	readonly origins: readonly CustomerCatalogBreakdownItem[];
	readonly locations: readonly CustomerCatalogBreakdownItem[];
	readonly highlights: readonly CustomerCatalogItem[];
	readonly page: number;
	readonly limit: number;
	readonly total: number;
	readonly totalPages: number;
};

/**
 * Persistence port for {@link Customer} (diagram: ICustomerRepository).
 */
interface ICustomerRepository {
	create(customer: Customer): Promise<Customer>;
	update(customer: Customer): Promise<Customer>;
	delete(id: UUID): Promise<void>;
	findById(id: UUID): Promise<Customer | null>;
	findByEmail(email: string): Promise<Customer | null>;
	/** CPF inválido (formato/checksum) lança antes da consulta; não retorna `null` silenciosamente por isso. */
	findByCpf(cpf: string): Promise<Customer | null>;
	list(): Promise<Customer[]>;
	listCatalog(
		filters: CustomerCatalogFilters,
		pagination: { readonly page: number; readonly limit: number },
	): Promise<CustomerCatalogPage>;
}

export type {
	CustomerCatalogBreakdownItem,
	CustomerCatalogFilters,
	CustomerCatalogItem,
	CustomerCatalogPage,
	CustomerCatalogSort,
	CustomerCatalogStatus,
	CustomerCatalogSummary,
	ICustomerRepository,
};
