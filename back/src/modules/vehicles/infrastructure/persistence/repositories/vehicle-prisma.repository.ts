import { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
// biome-ignore lint/style/useImportType: Uuid é classe em runtime
import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import { VehicleDeleteBlockedError } from '../../../domain/errors/vehicle-delete-blocked.error.js';
import type {
	VehicleCatalogFilters,
	VehicleCatalogPage,
	VehicleCatalogSort,
	VehicleListFilters,
	IVehicleRepository,
} from '../../../domain/repositories/vehicle.repository.js';
import type { Vehicle } from '../../../domain/entities/vehicle.entity.js';
import { VehicleMapper } from '../mappers/vehicle.mapper.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;
type VehicleCatalogRow = Prisma.VehicleGetPayload<{
	include: {
		store: { select: { name: true } };
		_count: { select: { deals: true } };
	};
}>;

const DAY_MS = 24 * 60 * 60 * 1000;

function computeTotalPages(total: number, limit: number): number {
	return Math.max(1, Math.ceil(total / limit));
}

function catalogOrderBy(
	sort: VehicleCatalogSort | undefined,
): Prisma.VehicleOrderByWithRelationInput[] {
	switch (sort) {
		case 'price_asc':
			return [{ price: 'asc' }, { createdAt: 'desc' }];
		case 'price_desc':
			return [{ price: 'desc' }, { createdAt: 'desc' }];
		case 'mileage_asc':
			return [{ mileage: 'asc' }, { createdAt: 'desc' }];
		case 'mileage_desc':
			return [{ mileage: 'desc' }, { createdAt: 'desc' }];
		default:
			return [{ createdAt: 'desc' }];
	}
}

class VehiclePrismaRepository implements IVehicleRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	async create(vehicle: Vehicle): Promise<Vehicle> {
		const row = VehicleMapper.toPersistence(vehicle);
		const created = await this.client.vehicle.create({
			data: {
				id: row.id,
				storeId: row.storeId,
				brand: row.brand,
				model: row.model,
				version: row.version,
				modelYear: row.modelYear,
				manufactureYear: row.manufactureYear,
				color: row.color,
				mileage: row.mileage,
				supportedFuelType: row.supportedFuelType,
				price: row.price,
				status: row.status,
				plate: row.plate,
				vin: row.vin,
				imageUrl: row.imageUrl,
				imageAlt: row.imageAlt,
				imageProvider: row.imageProvider,
				imageProviderPhotoId: row.imageProviderPhotoId,
				imagePhotographerName: row.imagePhotographerName,
				imagePhotographerUrl: row.imagePhotographerUrl,
				imageSourceUrl: row.imageSourceUrl,
				imageResolvedAt: row.imageResolvedAt,
				imageExpiresAt: row.imageExpiresAt,
			},
		});
		return VehicleMapper.toDomain(created);
	}

	async update(vehicle: Vehicle): Promise<Vehicle> {
		const row = VehicleMapper.toPersistence(vehicle);
		const updated = await this.client.vehicle.update({
			data: {
				brand: row.brand,
				model: row.model,
				version: row.version,
				modelYear: row.modelYear,
				manufactureYear: row.manufactureYear,
				color: row.color,
				mileage: row.mileage,
				supportedFuelType: row.supportedFuelType,
				price: row.price,
				status: row.status,
				plate: row.plate,
				vin: row.vin,
				imageUrl: row.imageUrl,
				imageAlt: row.imageAlt,
				imageProvider: row.imageProvider,
				imageProviderPhotoId: row.imageProviderPhotoId,
				imagePhotographerName: row.imagePhotographerName,
				imagePhotographerUrl: row.imagePhotographerUrl,
				imageSourceUrl: row.imageSourceUrl,
				imageResolvedAt: row.imageResolvedAt,
				imageExpiresAt: row.imageExpiresAt,
			},
			where: { id: row.id },
		});
		return VehicleMapper.toDomain(updated);
	}

	async delete(id: Uuid): Promise<void> {
		try {
			await this.client.vehicle.delete({ where: { id: id.value } });
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2003'
			) {
				throw VehicleDeleteBlockedError.fromReferentialIntegrityFailure(
					id.value,
				);
			}
			throw error;
		}
	}

	async findById(id: Uuid): Promise<Vehicle | null> {
		const row = await this.client.vehicle.findUnique({
			where: { id: id.value },
		});
		return row ? VehicleMapper.toDomain(row) : null;
	}

	async countDealsByVehicleId(id: Uuid): Promise<number> {
		return this.client.deal.count({ where: { vehicleId: id.value } });
	}

	async list(filters?: VehicleListFilters): Promise<readonly Vehicle[]> {
		const rows = await this.client.vehicle.findMany({
			where: {
				storeId: filters?.storeId ? filters.storeId.value : undefined,
				status: filters?.status,
			},
			orderBy: { createdAt: 'desc' },
		});
		return rows.map((r) => VehicleMapper.toDomain(r));
	}

	private buildCatalogWhere(
		filters: VehicleCatalogFilters,
		options: { readonly includeStatus: boolean },
	): Prisma.VehicleWhereInput {
		const search = filters.search?.trim();
		const searchOr: Prisma.VehicleWhereInput[] = [];

		if (search) {
			searchOr.push(
				{ brand: { contains: search, mode: 'insensitive' } },
				{ model: { contains: search, mode: 'insensitive' } },
				{ version: { contains: search, mode: 'insensitive' } },
				{ plate: { contains: search, mode: 'insensitive' } },
				{ vin: { contains: search, mode: 'insensitive' } },
			);
		}

		return {
			storeId: filters.storeId ? filters.storeId.value : undefined,
			status: options.includeStatus ? filters.status : undefined,
			OR: searchOr.length > 0 ? searchOr : undefined,
		};
	}

	async listCatalog(
		filters: VehicleCatalogFilters,
		pagination: { readonly page: number; readonly limit: number },
	): Promise<VehicleCatalogPage> {
		const skip = (pagination.page - 1) * pagination.limit;
		const where = this.buildCatalogWhere(filters, { includeStatus: true });
		const summaryWhere = this.buildCatalogWhere(filters, {
			includeStatus: false,
		});

		let rows: VehicleCatalogRow[];
		let total: number;

		if (filters.sort === 'interest_desc') {
			const candidates = await this.client.vehicle.findMany({
				where,
				select: {
					id: true,
					createdAt: true,
					_count: { select: { deals: { where: { status: 'OPEN' } } } },
				},
			});
			total = candidates.length;
			const pageIds = candidates
				.sort((a, b) => {
					const countDiff = b._count.deals - a._count.deals;
					if (countDiff !== 0) return countDiff;
					return b.createdAt.getTime() - a.createdAt.getTime();
				})
				.slice(skip, skip + pagination.limit)
				.map((row) => row.id);
			const unorderedRows =
				pageIds.length > 0
					? await this.client.vehicle.findMany({
							where: { id: { in: pageIds } },
							include: {
								store: { select: { name: true } },
								_count: {
									select: { deals: { where: { status: 'OPEN' } } },
								},
							},
						})
					: [];
			const rowById = new Map(unorderedRows.map((row) => [row.id, row]));
			rows = pageIds
				.map((id) => rowById.get(id))
				.filter((row): row is VehicleCatalogRow => Boolean(row));
		} else {
			const [pageRows, matchingTotal] = await Promise.all([
				this.client.vehicle.findMany({
					where,
					orderBy: catalogOrderBy(filters.sort),
					skip,
					take: pagination.limit,
					include: {
						store: { select: { name: true } },
						_count: {
							select: { deals: { where: { status: 'OPEN' } } },
						},
					},
				}),
				this.client.vehicle.count({ where }),
			]);
			rows = pageRows;
			total = matchingTotal;
		}

		const [average, summaryGroups, highInterestRows] = await Promise.all([
			this.client.vehicle.aggregate({
				where,
				_avg: { price: true },
			}),
			this.client.vehicle.groupBy({
				by: ['status'],
				where: summaryWhere,
				_count: { _all: true },
			}),
			this.client.vehicle.findMany({
				where: summaryWhere,
				select: {
					id: true,
					_count: {
						select: { deals: { where: { status: 'OPEN' } } },
					},
				},
			}),
		]);

		const rowVehicleIds = rows.map((row) => row.id);
		const interestRows =
			rowVehicleIds.length > 0
				? await this.client.deal.findMany({
						where: { vehicleId: { in: rowVehicleIds }, status: 'OPEN' },
						orderBy: { createdAt: 'desc' },
						select: {
							id: true,
							leadId: true,
							vehicleId: true,
							title: true,
							stage: true,
							status: true,
							createdAt: true,
							lead: {
								select: {
									customer: { select: { name: true } },
								},
							},
						},
					})
				: [];
		const interestsByVehicleId = new Map<
			string,
			{
				readonly leadId: string;
				readonly dealId: string;
				readonly customerName: string;
				readonly dealTitle: string;
				readonly dealStage: string;
				readonly dealStatus: string;
				readonly createdAt: Date;
			}[]
		>();

		for (const row of interestRows) {
			const current = interestsByVehicleId.get(row.vehicleId) ?? [];
			if (current.some((interest) => interest.leadId === row.leadId)) {
				continue;
			}
			current.push({
				leadId: row.leadId,
				dealId: row.id,
				customerName: row.lead?.customer?.name ?? 'Cliente sem nome',
				dealTitle: row.title,
				dealStage: row.stage,
				dealStatus: row.status,
				createdAt: row.createdAt,
			});
			interestsByVehicleId.set(row.vehicleId, current);
		}

		const averagePrice = average._avg.price
			? Number(average._avg.price.toString())
			: null;
		const summaryByStatus = Object.fromEntries(
			summaryGroups.map((group) => [group.status, group._count._all]),
		);
		const now = Date.now();

		return {
			items: rows.map((row) => {
				const price = Number(row.price.toString());
				const diff = averagePrice === null ? 0 : price - averagePrice;

				return {
					vehicle: VehicleMapper.toDomain(row),
					storeName: row.store.name,
					dealCount:
						interestsByVehicleId.get(row.id)?.length ?? row._count.deals,
					interests: interestsByVehicleId.get(row.id) ?? [],
					daysInStock: Math.max(
						0,
						Math.floor((now - row.createdAt.getTime()) / DAY_MS),
					),
					priceComparison:
						averagePrice === null
							? null
							: Math.abs(diff) < 0.01
								? 'AT_AVERAGE'
								: diff > 0
									? 'ABOVE_AVERAGE'
									: 'BELOW_AVERAGE',
				};
			}),
			summary: {
				total:
					(summaryByStatus.AVAILABLE ?? 0) +
					(summaryByStatus.RESERVED ?? 0) +
					(summaryByStatus.SOLD ?? 0) +
					(summaryByStatus.INACTIVE ?? 0),
				available: summaryByStatus.AVAILABLE ?? 0,
				reserved: summaryByStatus.RESERVED ?? 0,
				sold: summaryByStatus.SOLD ?? 0,
				inactive: summaryByStatus.INACTIVE ?? 0,
				highInterest: highInterestRows.filter((row) => row._count.deals > 0)
					.length,
			},
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

export { VehiclePrismaRepository };
