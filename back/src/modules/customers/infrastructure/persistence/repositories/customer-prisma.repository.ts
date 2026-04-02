import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import { Email } from '../../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../../shared/domain/value-objects/name.value-object.js';
import { Phone } from '../../../../../shared/domain/value-objects/phone.value-object.js';
import { Customer } from '../../../domain/entities/customer.entity.js';
import type { ICustomerRepository } from '../../../domain/repositories/customer.repository.js';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;
type CustomerRecord = {
	readonly id: string;
	readonly name: string;
	readonly email: string | null;
	readonly phone: string | null;
};

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
			},
			where: { id: customer.id },
		});
		return this.toDomain(updated);
	}

	async delete(id: string): Promise<void> {
		await this.client.customer.delete({ where: { id } });
	}

	async findById(id: string): Promise<Customer | null> {
		const customer = await this.client.customer.findUnique({ where: { id } });
		return customer ? this.toDomain(customer) : null;
	}

	async findByEmail(email: string): Promise<Customer | null> {
		const customer = await this.client.customer.findUnique({
			where: { email },
		});
		return customer ? this.toDomain(customer) : null;
	}

	async findByCpf(_cpf: string): Promise<Customer | null> {
		// CPF is not persisted yet in Prisma schema.
		return null;
	}

	async list(): Promise<Customer[]> {
		const customers = await this.client.customer.findMany({
			orderBy: { createdAt: 'desc' },
		});
		return customers.map((customer) => this.toDomain(customer));
	}

	private toDomain(record: CustomerRecord): Customer {
		return new Customer(
			record.id,
			Name.create(record.name),
			record.email ? Email.create(record.email) : null,
			record.phone ? Phone.create(record.phone) : null,
			null,
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
