import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { IStoreRepository } from '../../../domain/repositories/store.repository.js';
import { StoreDeleteBlockedError } from '../../../domain/errors/store-delete-blocked.error.js';
import { StoreMapper } from '../mappers/store.mapper.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

function isPrismaKnownRequest(
	error: unknown,
): error is { code: string; meta?: { field_name?: string } } {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		typeof (error as { code: unknown }).code === 'string'
	);
}

/** Violação de FK ao excluir pai (Prisma: P2003 / P2014 conforme versão). */
function isForeignKeyViolationOnDelete(error: unknown): boolean {
	return (
		isPrismaKnownRequest(error) &&
		(error.code === 'P2003' || error.code === 'P2014')
	);
}

class StorePrismaRepository implements IStoreRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	async create(store: Parameters<IStoreRepository['create']>[0]) {
		const record = StoreMapper.toRecord(store);
		const created = await this.client.store.create({
			data: {
				id: record.id,
				name: record.name,
			},
		});
		return StoreMapper.toDomain(created);
	}

	async update(store: Parameters<IStoreRepository['update']>[0]) {
		const record = StoreMapper.toRecord(store);
		const updated = await this.client.store.update({
			data: { name: record.name },
			where: { id: record.id },
		});
		return StoreMapper.toDomain(updated);
	}

	async delete(id: Parameters<IStoreRepository['delete']>[0]): Promise<void> {
		try {
			await this.client.store.delete({ where: { id: id.value } });
		} catch (error: unknown) {
			if (isForeignKeyViolationOnDelete(error)) {
				throw StoreDeleteBlockedError.fromReferentialIntegrityFailure(id.value);
			}
			throw error;
		}
	}

	async findById(id: Parameters<IStoreRepository['findById']>[0]) {
		const store = await this.client.store.findUnique({
			where: { id: id.value },
		});
		return store ? StoreMapper.toDomain(store) : null;
	}

	async list() {
		const stores = await this.client.store.findMany({
			orderBy: { createdAt: 'desc' },
		});
		return stores.map((store) => StoreMapper.toDomain(store));
	}

	async countBlockingReferences(id: Parameters<IStoreRepository['delete']>[0]) {
		const [leads, teams] = await Promise.all([
			this.client.lead.count({ where: { storeId: id.value } }),
			this.client.team.count({ where: { storeId: id.value } }),
		]);
		return { leads, teams };
	}

	private get client(): PrismaClientLike {
		return (
			(this.transactionContext?.client as Prisma.TransactionClient) ??
			this.prisma
		);
	}
}

export { StorePrismaRepository };
