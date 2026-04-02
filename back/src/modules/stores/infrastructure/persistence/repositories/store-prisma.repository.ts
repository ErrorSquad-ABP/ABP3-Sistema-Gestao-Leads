import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../../shared/domain/value-objects/name.value-object.js';
import { Store } from '../../../domain/entities/store.entity.js';
import type { IStoreRepository } from '../../../domain/repositories/store.repository.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;
type StoreRecord = {
	readonly id: string;
	readonly name: string;
};

class StorePrismaRepository implements IStoreRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	async create(store: Store): Promise<Store> {
		const created = await this.client.store.create({
			data: {
				name: store.name.value,
			},
		});
		return this.toDomain(created);
	}

	async update(store: Store): Promise<Store> {
		const updated = await this.client.store.update({
			data: { name: store.name.value },
			where: { id: store.id.value },
		});
		return this.toDomain(updated);
	}

	async delete(id: Parameters<IStoreRepository['delete']>[0]): Promise<void> {
		await this.client.store.delete({ where: { id: id.value } });
	}

	async findById(
		id: Parameters<IStoreRepository['findById']>[0],
	): Promise<Store | null> {
		const store = await this.client.store.findUnique({
			where: { id: id.value },
		});
		return store ? this.toDomain(store) : null;
	}

	async list(): Promise<Store[]> {
		const stores = await this.client.store.findMany({
			orderBy: { createdAt: 'desc' },
		});
		return stores.map((store) => this.toDomain(store));
	}

	private toDomain(record: StoreRecord): Store {
		return new Store(Uuid.parse(record.id), Name.create(record.name));
	}

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}
}

export { StorePrismaRepository };
