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
	DealPipelineStagePage,
	IDealRepository,
} from '../../../domain/repositories/deal.repository.js';
import { computeTotalPages } from '../../../domain/types/deal-list-page.js';
import { DEAL_STAGES } from '../../../../../shared/domain/enums/deal-stage.enum.js';
import { DealMapper } from '../mappers/deal.mapper.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

/** Campos comuns do lead em consultas enriquecidas (cliente + owner). */
const DEAL_LEAD_ENRICHMENT_SELECT = {
	storeId: true,
	ownerUserId: true,
	customer: { select: { name: true } },
	owner: { select: { name: true } },
} as const;

const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class DealPrismaRepository implements IDealRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	private buildScopedWhere(
		filters: DealListScopedFilters,
	): Prisma.DealWhereInput {
		const search = filters.search?.trim();
		const searchOr: Prisma.DealWhereInput[] = [];

		if (search) {
			searchOr.push(
				{ title: { contains: search, mode: 'insensitive' } },
				{
					lead: {
						is: {
							customer: {
								is: { name: { contains: search, mode: 'insensitive' } },
							},
						},
					},
				},
				{
					lead: {
						is: {
							owner: {
								is: { name: { contains: search, mode: 'insensitive' } },
							},
						},
					},
				},
				{
					vehicle: { is: { brand: { contains: search, mode: 'insensitive' } } },
				},
				{
					vehicle: { is: { model: { contains: search, mode: 'insensitive' } } },
				},
				{
					vehicle: { is: { plate: { contains: search, mode: 'insensitive' } } },
				},
			);

			if (UUID_PATTERN.test(search)) {
				searchOr.push(
					{ id: search },
					{ leadId: search },
					{ vehicleId: search },
				);
			}
		}

		return {
			status: filters.status,
			importance: filters.importance,
			stage: filters.stage,
			OR: searchOr.length > 0 ? searchOr : undefined,
			lead: {
				is: {
					storeId: filters.storeIds ? { in: [...filters.storeIds] } : undefined,
					ownerUserId: filters.ownerUserId,
				},
			},
		};
	}

	private pipelineOrderBy(
		filters: DealListScopedFilters,
	): Prisma.DealOrderByWithRelationInput[] {
		if (filters.valueSort === 'asc') {
			return [{ value: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }];
		}
		if (filters.valueSort === 'desc') {
			return [
				{ value: { sort: 'desc', nulls: 'last' } },
				{ createdAt: 'desc' },
			];
		}
		return [{ createdAt: 'desc' }];
	}

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
				lead: {
					select: DEAL_LEAD_ENRICHMENT_SELECT,
				},
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
				lead: {
					select: DEAL_LEAD_ENRICHMENT_SELECT,
				},
			},
		});
		return rows as DealEnrichedRow[];
	}

	async listScoped(
		filters: DealListScopedFilters,
		pagination: { readonly page: number; readonly limit: number },
	) {
		const skip = (pagination.page - 1) * pagination.limit;
		const where = this.buildScopedWhere(filters);

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
		const where = this.buildScopedWhere(filters);

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
					lead: {
						select: DEAL_LEAD_ENRICHMENT_SELECT,
					},
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

	async listPipelineStagesEnriched(
		filters: DealListScopedFilters,
		pagination: { readonly page: number; readonly limit: number },
	): Promise<readonly DealPipelineStagePage[]> {
		return Promise.all(
			DEAL_STAGES.map((stage) =>
				this.listPipelineStageEnriched({ ...filters, stage }, pagination),
			),
		);
	}

	async listPipelineStageEnriched(
		filters: DealListScopedFilters & {
			readonly stage: (typeof DEAL_STAGES)[number];
		},
		pagination: { readonly page: number; readonly limit: number },
	): Promise<DealPipelineStagePage> {
		const skip = (pagination.page - 1) * pagination.limit;
		const where = this.buildScopedWhere(filters);

		const [rows, total, aggregate] = await Promise.all([
			this.client.deal.findMany({
				where,
				orderBy: this.pipelineOrderBy(filters),
				skip,
				take: pagination.limit,
				include: {
					vehicle: {
						select: { brand: true, model: true, modelYear: true, plate: true },
					},
					lead: {
						select: DEAL_LEAD_ENRICHMENT_SELECT,
					},
				},
			}),
			this.client.deal.count({ where }),
			this.client.deal.aggregate({
				where,
				_sum: { value: true },
			}),
		]);

		return {
			stage: filters.stage,
			items: rows as DealEnrichedRow[],
			page: pagination.page,
			limit: pagination.limit,
			total,
			totalPages: computeTotalPages(total, pagination.limit),
			totalValue: aggregate._sum.value?.toString() ?? null,
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
