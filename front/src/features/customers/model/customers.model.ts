import type { LeadCustomer } from "@/features/leads/model/leads.model"
import type { z } from "zod"

import type {
	customerCatalogSchema,
	customerCatalogSorts,
	customerStatusValues,
} from "../schemas/customer.schema"

type CustomerRecord = LeadCustomer
type CustomerCatalog = z.infer<typeof customerCatalogSchema>
type CustomerCatalogItem = CustomerCatalog["items"][number]
type CustomerCatalogSort = (typeof customerCatalogSorts)[number]
type CustomerCatalogStatus = (typeof customerStatusValues)[number]

type CustomerMutationInput = {
	name: string
	email?: string | null
	phone?: string | null
	cpf?: string | null
}

type CustomerDialogMode = "create" | "edit"

export type {
	CustomerCatalog,
	CustomerCatalogItem,
	CustomerCatalogSort,
	CustomerCatalogStatus,
	CustomerDialogMode,
	CustomerMutationInput,
	CustomerRecord,
}
