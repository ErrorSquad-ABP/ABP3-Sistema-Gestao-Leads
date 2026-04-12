import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Cpf } from '../../../../shared/domain/value-objects/cpf.value-object.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { CustomerCpfAlreadyExistsError } from '../../domain/errors/customer-cpf-already-exists.error.js';
import { CustomerEmailAlreadyExistsError } from '../../domain/errors/customer-email-already-exists.error.js';
// biome-ignore lint/style/useImportType: Nest DI — classes must exist at runtime for constructor metadata
import { CustomerFactory } from '../../domain/factories/customer.factory.js';
// biome-ignore lint/style/useImportType: Nest DI — classes must exist at runtime for constructor metadata
import { CustomerRepositoryFactory } from '../../infrastructure/persistence/factories/customer-repository.factory.js';
import type { CreateCustomerDto } from '../dto/create-customer.dto.js';

@Injectable()
class CreateCustomerUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly customerFactory: CustomerFactory,
		private readonly customerRepositoryFactory: CustomerRepositoryFactory,
	) {}

	async execute(dto: CreateCustomerDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const customers =
				this.customerRepositoryFactory.create(transactionContext);

			if (dto.email !== undefined && dto.email !== null) {
				const email = Email.create(dto.email);
				const existing = await customers.findByEmail(email.value);
				if (existing) {
					throw new CustomerEmailAlreadyExistsError(email.value);
				}
			}

			if (dto.cpf !== undefined && dto.cpf !== null) {
				const cpf = Cpf.create(dto.cpf);
				const existing = await customers.findByCpf(cpf.value);
				if (existing) {
					throw new CustomerCpfAlreadyExistsError(cpf.value);
				}
			}

			const customer = this.customerFactory.create({
				name: dto.name,
				email: dto.email ?? null,
				phone: dto.phone ?? null,
				cpf: dto.cpf ?? null,
			});

			return customers.create(customer);
		});
	}
}

export { CreateCustomerUseCase };
