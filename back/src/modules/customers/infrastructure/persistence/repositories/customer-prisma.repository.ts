import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import { Cpf } from '../../../../../shared/domain/value-objects/cpf.value-object.js';
import { Email } from '../../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../../shared/domain/value-objects/name.value-object.js';
import { Phone } from '../../../../../shared/domain/value-objects/phone.value-object.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import { Customer } from '../../../domain/entities/customer.entity.js';
import type {
	CustomerCatalogBreakdownItem,
	CustomerCatalogFilters,
	CustomerCatalogItem,
	CustomerCatalogPage,
	CustomerCatalogStatus,
	ICustomerRepository,
} from '../../../domain/repositories/customer.repository.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;
type CustomerRecord = {
	readonly id: string;
	readonly name: string;
	readonly email: string | null;
	readonly phone: string | null;
	readonly cpf: string | null;
};
type CustomerCatalogRow = Prisma.CustomerGetPayload<{
	include: {
		leads: {
			include: {
				store: { select: { name: true } };
				deals: true;
			};
		};
	};
}>;

const CUSTOMER_CATALOG_DEFAULT_SOURCE = 'Cadastro';

function computeTotalPages(total: number, limit: number): number {
	return Math.max(1, Math.ceil(total / limit));
}

function decimalLikeToNumber(value: unknown): number {
	if (value === null || value === undefined) {
		return 0;
	}
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : 0;
	}
	const parsed = Number(String(value));
	return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeSearch(value: string): string {
	return value.trim().toLowerCase();
}

function customerMatchesSearch(
	row: CustomerCatalogRow,
	search: string,
): boolean {
	if (!search) {
		return true;
	}
	return [row.name, row.email ?? '', row.phone ?? '', row.cpf ?? '']
		.join(' ')
		.toLowerCase()
		.includes(search);
}

function getLastActivity(row: CustomerCatalogRow): {
	readonly at: Date | null;
	readonly label: string;
} {
	let lastActivityAt: Date | null = row.updatedAt;
	let label = 'Cadastro';

	for (const lead of row.leads) {
		if (lead.updatedAt > (lastActivityAt ?? new Date(0))) {
			lastActivityAt = lead.updatedAt;
			label = 'Lead atualizado';
		}

		for (const deal of lead.deals) {
			if (deal.updatedAt > (lastActivityAt ?? new Date(0))) {
				lastActivityAt = deal.updatedAt;
				label =
					deal.status === 'WON'
						? 'Negociação ganha'
						: deal.status === 'LOST'
							? 'Negociação perdida'
							: 'Negociação aberta';
			}
		}
	}

	return { at: lastActivityAt, label };
}

function sortBreakdown(
	items: CustomerCatalogBreakdownItem[],
): CustomerCatalogBreakdownItem[] {
	return [...items].sort((left, right) => {
		if (right.count !== left.count) {
			return right.count - left.count;
		}
		return left.label.localeCompare(right.label, 'pt-BR');
	});
}

class CustomerPrismaRepository implements ICustomerRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	async create(customer: Customer): Promise<Customer> {
		const created = await this.client.customer.create({
			data: {
				email: customer.email?.value ?? null,
				name: customer.name.value,
				phone: customer.phone?.value ?? null,
				cpf: customer.cpf?.value ?? null,
			},
		});
		return this.toDomain(created);
	}

	async update(customer: Customer): Promise<Customer> {
		const updated = await this.client.customer.update({
			data: {
				email: customer.email?.value ?? null,
				name: customer.name.value,
				phone: customer.phone?.value ?? null,
				cpf: customer.cpf?.value ?? null,
			},
			where: { id: customer.id.value },
		});
		return this.toDomain(updated);
	}

	async delete(
		id: Parameters<ICustomerRepository['delete']>[0],
	): Promise<void> {
		await this.client.customer.delete({ where: { id: id.value } });
	}

	async findById(
		id: Parameters<ICustomerRepository['findById']>[0],
	): Promise<Customer | null> {
		const customer = await this.client.customer.findUnique({
			where: { id: id.value },
		});
		return customer ? this.toDomain(customer) : null;
	}

	async findByEmail(email: string): Promise<Customer | null> {
		const customer = await this.client.customer.findUnique({
			where: { email },
		});
		return customer ? this.toDomain(customer) : null;
	}

	/**
	 * Busca por CPF normalizado (11 dígitos). Entrada inválida: `Cpf.create` lança (falha explícita).
	 */
	async findByCpf(cpf: string): Promise<Customer | null> {
		const normalized = Cpf.create(cpf);
		const customer = await this.client.customer.findUnique({
			where: { cpf: normalized.value },
		});
		return customer ? this.toDomain(customer) : null;
	}

	async list(): Promise<Customer[]> {
		const customers = await this.client.customer.findMany({
			orderBy: { createdAt: 'desc' },
		});
		return customers.map((customer) => this.toDomain(customer));
	}

	async listCatalog(
		filters: CustomerCatalogFilters,
		pagination: { readonly page: number; readonly limit: number },
	): Promise<CustomerCatalogPage> {
		const rows = await this.client.customer.findMany({
			include: {
				leads: {
					include: {
						store: { select: { name: true } },
						deals: true,
					},
					orderBy: { updatedAt: 'desc' },
				},
			},
			orderBy: { createdAt: 'desc' },
		});

		const search = normalizeSearch(filters.search ?? '');
		const enriched = rows
			.filter((row) => customerMatchesSearch(row, search))
			.filter((row) =>
				filters.storeId
					? row.leads.some((lead) => lead.storeId === filters.storeId?.value)
					: true,
			)
			.map((row): CustomerCatalogItem => {
				const deals = row.leads.flatMap((lead) => lead.deals);
				const openDealsCount = deals.filter(
					(deal) => deal.status === 'OPEN',
				).length;
				const wonDealsCount = deals.filter(
					(deal) => deal.status === 'WON',
				).length;
				const totalDealValue = deals.reduce(
					(total, deal) => total + decimalLikeToNumber(deal.value),
					0,
				);
				const primaryLead = row.leads[0] ?? null;
				const lastActivity = getLastActivity(row);
				const status: CustomerCatalogStatus =
					row.leads.length > 0 || row.email || row.phone
						? 'ACTIVE'
						: 'INACTIVE';

				return {
					customer: this.toDomain(row),
					primaryStoreName: primaryLead?.store.name ?? null,
					leadCount: row.leads.length,
					openDealsCount,
					wonDealsCount,
					totalDealsCount: deals.length,
					totalDealValue: totalDealValue.toFixed(2),
					lastActivityAt: lastActivity.at,
					lastActivityLabel: lastActivity.label,
					status,
					source: primaryLead?.source ?? CUSTOMER_CATALOG_DEFAULT_SOURCE,
				};
			})
			.filter((item) =>
				filters.status ? item.status === filters.status : true,
			);

		const sorted = [...enriched].sort((left, right) => {
			switch (filters.sort) {
				case 'deals_desc':
					return (
						right.openDealsCount - left.openDealsCount ||
						right.totalDealsCount - left.totalDealsCount ||
						left.customer.name.value.localeCompare(
							right.customer.name.value,
							'pt-BR',
						)
					);
				case 'value_desc':
					return (
						decimalLikeToNumber(right.totalDealValue) -
							decimalLikeToNumber(left.totalDealValue) ||
						left.customer.name.value.localeCompare(
							right.customer.name.value,
							'pt-BR',
						)
					);
				case 'name_asc':
					return left.customer.name.value.localeCompare(
						right.customer.name.value,
						'pt-BR',
					);
				default:
					return (
						(right.lastActivityAt?.getTime() ?? 0) -
							(left.lastActivityAt?.getTime() ?? 0) ||
						left.customer.name.value.localeCompare(
							right.customer.name.value,
							'pt-BR',
						)
					);
			}
		});

		const originCounts = new Map<string, number>();
		const locationCounts = new Map<string, number>();
		for (const item of enriched) {
			const originLabel = item.source ?? 'Outros';
			const locationLabel = item.primaryStoreName ?? 'Sem loja vinculada';
			originCounts.set(originLabel, (originCounts.get(originLabel) ?? 0) + 1);
			locationCounts.set(
				locationLabel,
				(locationCounts.get(locationLabel) ?? 0) + 1,
			);
		}
		const origins = Array.from(originCounts, ([label, count]) => ({
			label,
			count,
		}));
		const locations = Array.from(locationCounts, ([label, count]) => ({
			label,
			count,
		}));

		const total = sorted.length;
		const start = (pagination.page - 1) * pagination.limit;
		const pageItems = sorted.slice(start, start + pagination.limit);

		return {
			items: pageItems,
			summary: {
				total: enriched.length,
				withDeals: enriched.filter((item) => item.totalDealsCount > 0).length,
				active: enriched.filter((item) => item.status === 'ACTIVE').length,
				retentionRate:
					enriched.length > 0
						? Math.round(
								(enriched.filter((item) => item.wonDealsCount > 0).length /
									enriched.length) *
									100,
							)
						: 0,
			},
			origins: sortBreakdown(origins).slice(0, 5),
			locations: sortBreakdown(locations).slice(0, 5),
			highlights: [...enriched]
				.sort((left, right) => {
					const valueDiff =
						decimalLikeToNumber(right.totalDealValue) -
						decimalLikeToNumber(left.totalDealValue);
					if (valueDiff !== 0) {
						return valueDiff;
					}
					return right.totalDealsCount - left.totalDealsCount;
				})
				.slice(0, 5),
			page: pagination.page,
			limit: pagination.limit,
			total,
			totalPages: computeTotalPages(total, pagination.limit),
		};
	}

	private toDomain(record: CustomerRecord): Customer {
		return new Customer(
			Uuid.parse(record.id),
			Name.create(record.name),
			record.email ? Email.create(record.email) : null,
			record.phone ? Phone.create(record.phone) : null,
			record.cpf ? Cpf.create(record.cpf) : null,
		);
	}

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}
}

export { CustomerPrismaRepository };
