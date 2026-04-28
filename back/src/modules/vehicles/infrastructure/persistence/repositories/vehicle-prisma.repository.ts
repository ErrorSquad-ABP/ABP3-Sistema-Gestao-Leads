import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
// biome-ignore lint/style/useImportType: Uuid é classe em runtime
import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import type {
	VehicleListFilters,
	IVehicleRepository,
} from '../../../domain/repositories/vehicle.repository.js';
import type { Vehicle } from '../../../domain/entities/vehicle.entity.js';
import { VehicleMapper } from '../mappers/vehicle.mapper.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

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
			},
			where: { id: row.id },
		});
		return VehicleMapper.toDomain(updated);
	}

	async findById(id: Uuid): Promise<Vehicle | null> {
		const row = await this.client.vehicle.findUnique({
			where: { id: id.value },
		});
		return row ? VehicleMapper.toDomain(row) : null;
	}

	async list(filters?: VehicleListFilters): Promise<readonly Vehicle[]> {
		const rows = await this.client.vehicle.findMany({
			where: {
				storeId: filters?.storeId ? filters.storeId.value : undefined,
				status: filters?.status,
				deals: filters?.withoutOpenDeal
					? { none: { status: 'OPEN' } }
					: undefined,
			},
			orderBy: { createdAt: 'desc' },
		});
		return rows.map((r) => VehicleMapper.toDomain(r));
	}

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}
}

export { VehiclePrismaRepository };
