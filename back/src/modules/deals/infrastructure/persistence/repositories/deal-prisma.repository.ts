import { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
// biome-ignore lint/style/useImportType: Uuid é classe em runtime
import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import { ActiveDealAlreadyExistsError } from '../../../domain/errors/active-deal-already-exists.error.js';
import { ActiveDealForVehicleAlreadyExistsError } from '../../../domain/errors/active-deal-for-vehicle-already-exists.error.js';
import type { Deal } from '../../../domain/entities/deal.entity.js';
import type {
	DealEnrichedListPage,
	DealEnrichedRow,
	DealListScopedFilters,
	IDealRepository,
} from '../../../domain/repositories/deal.repository.js';
import { computeTotalPages } from '../../../domain/types/deal-list-page.js';
import { DealMapper } from '../mappers/deal.mapper.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

class DealPrismaRepository implements IDealRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	async create(deal: Deal): Promise<Deal> {
		const row = DealMapper.toPersistence(deal);
		try {
			const created = await this.client.deal.create({
				data: {
					id: row.id,
					leadId: row.leadId,
					vehicleId: row.vehicleId,
					title: row.title,
					value: row.value,
					importance: row.importance,
					stage: row.stage,
					status: row.status,
					closedAt: row.closedAt,
				},
			});
			return DealMapper.toDomain(created);
		} catch (error: unknown) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				const target = (error.meta as { target?: unknown } | undefined)?.target;
				if (Array.isArray(target) && target.includes('vehicleId')) {
					throw new ActiveDealForVehicleAlreadyExistsError(row.vehicleId);
				}
				throw new ActiveDealAlreadyExistsError(row.leadId);
			}
			throw error;
		}
	}

	async update(deal: Deal): Promise<Deal> {
		const row = DealMapper.toPersistence(deal);
		const updated = await this.client.deal.update({
			data: {
				vehicleId: row.vehicleId,
				title: row.title,
				value: row.value,
				importance: row.importance,
				stage: row.stage,
				status: row.status,
				closedAt: row.closedAt,
			},
			where: { id: row.id },
		});
		return DealMapper.toDomain(updated);
	}

	async delete(id: Uuid): Promise<void> {
		await this.client.deal.delete({ where: { id: id.value } });
	}

	async findById(id: Uuid): Promise<Deal | null> {
		const row = await this.client.deal.findUnique({ where: { id: id.value } });
		return row ? DealMapper.toDomain(row) : null;
	}

	async findByIdEnriched(id: Uuid): Promise<DealEnrichedRow | null> {
		const row = await this.client.deal.findUnique({
			where: { id: id.value },
			include: {
				vehicle: {
					select: { brand: true, model: true, modelYear: true, plate: true },
				},
				lead: { select: { customer: { select: { name: true } } } },
			},
		});
		return row as DealEnrichedRow | null;
	}

	async findOpenByLeadId(leadId: Uuid): Promise<Deal | null> {
		const row = await this.client.deal.findFirst({
			where: { leadId: leadId.value, status: 'OPEN' },
		});
		return row ? DealMapper.toDomain(row) : null;
	}

	async findOpenByVehicleId(vehicleId: Uuid): Promise<Deal | null> {
		const row = await this.client.deal.findFirst({
			where: { vehicleId: vehicleId.value, status: 'OPEN' },
		});
		return row ? DealMapper.toDomain(row) : null;
	}

	async listByLeadId(leadId: Uuid): Promise<readonly Deal[]> {
		const rows = await this.client.deal.findMany({
			where: { leadId: leadId.value },
			orderBy: { createdAt: 'desc' },
		});
		return rows.map((r) => DealMapper.toDomain(r));
	}

	async listByLeadIdEnriched(
		leadId: Uuid,
	): Promise<readonly DealEnrichedRow[]> {
		const rows = await this.client.deal.findMany({
			where: { leadId: leadId.value },
			orderBy: { createdAt: 'desc' },
			include: {
				vehicle: {
					select: { brand: true, model: true, modelYear: true, plate: true },
				},
				lead: { select: { customer: { select: { name: true } } } },
			},
		});
		return rows as DealEnrichedRow[];
	}

	async listScoped(
		filters: DealListScopedFilters,
		pagination: { readonly page: number; readonly limit: number },
	) {
		const skip = (pagination.page - 1) * pagination.limit;

		const where: Prisma.DealWhereInput = {
			status: filters.status,
			lead: {
				is: {
					storeId: filters.storeIds ? { in: [...filters.storeIds] } : undefined,
					ownerUserId: filters.ownerUserId,
				},
			},
		};

		const [rows, total] = await Promise.all([
			this.client.deal.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip,
				take: pagination.limit,
			}),
			this.client.deal.count({ where }),
		]);

		return {
			items: rows.map((r) => DealMapper.toDomain(r)),
			page: pagination.page,
			limit: pagination.limit,
			total,
			totalPages: computeTotalPages(total, pagination.limit),
		};
	}

	async listScopedEnriched(
		filters: DealListScopedFilters,
		pagination: { readonly page: number; readonly limit: number },
	): Promise<DealEnrichedListPage> {
		const skip = (pagination.page - 1) * pagination.limit;

		const where: Prisma.DealWhereInput = {
			status: filters.status,
			lead: {
				is: {
					storeId: filters.storeIds ? { in: [...filters.storeIds] } : undefined,
					ownerUserId: filters.ownerUserId,
				},
			},
		};

		const [rows, total] = await Promise.all([
			this.client.deal.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip,
				take: pagination.limit,
				include: {
					vehicle: {
						select: { brand: true, model: true, modelYear: true, plate: true },
					},
					lead: { select: { customer: { select: { name: true } } } },
				},
			}),
			this.client.deal.count({ where }),
		]);

		return {
			items: rows as DealEnrichedRow[],
			page: pagination.page,
			limit: pagination.limit,
			total,
			totalPages: computeTotalPages(total, pagination.limit),
		};
	}

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}
}

export { DealPrismaRepository };
