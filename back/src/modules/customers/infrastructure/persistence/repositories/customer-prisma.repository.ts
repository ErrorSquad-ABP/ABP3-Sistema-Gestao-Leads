import type { Prisma } from '../../../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import { Cpf } from '../../../../../shared/domain/value-objects/cpf.value-object.js';
import { Email } from '../../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../../shared/domain/value-objects/name.value-object.js';
import { Phone } from '../../../../../shared/domain/value-objects/phone.value-object.js';
import type { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import { Customer } from '../../../domain/entities/customer.entity.js';
import { CustomerCpfAlreadyExistsError } from '../../../domain/errors/customer-cpf-already-exists.error.js';
import { CustomerEmailAlreadyExistsError } from '../../../domain/errors/customer-email-already-exists.error.js';
import type { ICustomerRepository } from '../../../domain/repositories/customer.repository.js';

function isPrismaKnownRequest(
	error: unknown,
): error is { code: string; meta?: { target?: string | string[] } } {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		typeof (error as { code: unknown }).code === 'string'
	);
}

type PrismaClientLike = PrismaService | Prisma.TransactionClient;
type CustomerRecord = {
	readonly id: string;
	readonly name: string;
	readonly email: string | null;
	readonly phone: string | null;
	readonly cpf: string | null;
};

class CustomerPrismaRepository implements ICustomerRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionContext?: TransactionContext,
	) {}

	async create(customer: Customer): Promise<Customer> {
		try {
			const created = await this.client.customer.create({
				data: {
					email: customer.email?.value ?? null,
					name: customer.name.value,
					phone: customer.phone?.value ?? null,
					cpf: customer.cpf?.value ?? null,
				},
			});
			return this.toDomain(created);
		} catch (error: unknown) {
			this.rethrowPrismaCustomerUniqueErrors(error, customer);
			throw error;
		}
	}

	async update(customer: Customer): Promise<Customer> {
		try {
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
		} catch (error: unknown) {
			this.rethrowPrismaCustomerUniqueErrors(error, customer);
			throw error;
		}
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

	private rethrowPrismaCustomerUniqueErrors(
		error: unknown,
		customer: Customer,
	): void {
		if (!isPrismaKnownRequest(error) || error.code !== 'P2002') {
			return;
		}
		const target = error.meta?.target;
		const targets = Array.isArray(target)
			? target
			: target !== undefined && target !== null
				? [String(target)]
				: [];
		const lowered = targets.map((t) => String(t).toLowerCase());
		if (lowered.some((t) => t.includes('email')) && customer.email) {
			throw new CustomerEmailAlreadyExistsError(customer.email.value);
		}
		if (lowered.some((t) => t.includes('cpf')) && customer.cpf) {
			throw new CustomerCpfAlreadyExistsError(customer.cpf.value);
		}
	}
}

export { CustomerPrismaRepository };
