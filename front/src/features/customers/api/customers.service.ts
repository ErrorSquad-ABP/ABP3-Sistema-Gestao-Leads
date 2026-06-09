import { apiFetch } from "@/lib/http/api-client"

import { parseCustomerCatalogResponse } from "../schemas/customer.schema"
import type {
	CustomerCatalogSort,
	CustomerCatalogStatus,
} from "../model/customers.model"

export {
	createCustomer,
	deleteCustomer,
	listLeadCustomers as listCustomers,
	updateCustomer,
} from "@/features/leads/api/leads.service"

export type {
	CreateCustomerBody as CustomerMutationInput,
	UpdateCustomerBody,
} from "@/features/leads/api/leads.service"

type CustomerCatalogFilters = {
	search?: string
	storeId?: string
	status?: CustomerCatalogStatus
	sort?: CustomerCatalogSort
	page: number
	limit: number
}

function customerCatalogQuery(filters: CustomerCatalogFilters) {
	const params = new URLSearchParams()
	if (filters.search?.trim()) {
		params.set("search", filters.search.trim())
	}
	if (filters.storeId) {
		params.set("storeId", filters.storeId)
	}
	if (filters.status) {
		params.set("status", filters.status)
	}
	if (filters.sort) {
		params.set("sort", filters.sort)
	}
	params.set("page", String(filters.page))
	params.set("limit", String(filters.limit))
	return params.toString()
}

async function listCustomerCatalog(
	filters: CustomerCatalogFilters,
	signal?: AbortSignal
) {
	const query = customerCatalogQuery(filters)
	const raw = await apiFetch<unknown>(`/api/customers/catalog?${query}`, {
		signal,
	})
	return parseCustomerCatalogResponse(raw)
}

export { listCustomerCatalog }
export type { CustomerCatalogFilters }
