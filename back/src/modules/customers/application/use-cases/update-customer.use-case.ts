import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Cpf } from '../../../../shared/domain/value-objects/cpf.value-object.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { CustomerCpfAlreadyExistsError } from '../../domain/errors/customer-cpf-already-exists.error.js';
import { CustomerEmailAlreadyExistsError } from '../../domain/errors/customer-email-already-exists.error.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest DI — classes must exist at runtime for constructor metadata
import { CustomerFactory } from '../../domain/factories/customer.factory.js';
// biome-ignore lint/style/useImportType: Nest DI — classes must exist at runtime for constructor metadata
import { CustomerRepositoryFactory } from '../../infrastructure/persistence/factories/customer-repository.factory.js';
import type { UpdateCustomerDto } from '../dto/update-customer.dto.js';

@Injectable()
class UpdateCustomerUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly customerFactory: CustomerFactory,
		private readonly customerRepositoryFactory: CustomerRepositoryFactory,
	) {}

	async execute(id: string, dto: UpdateCustomerDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const customers =
				this.customerRepositoryFactory.create(transactionContext);

			const existing = await customers.findById(Uuid.parse(id));
			if (!existing) {
				throw new CustomerNotFoundError(id);
			}

			if (dto.email !== undefined && dto.email !== null) {
				const email = Email.create(dto.email);
				const found = await customers.findByEmail(email.value);
				if (found && found.id.value !== existing.id.value) {
					throw new CustomerEmailAlreadyExistsError(email.value);
				}
			}

			if (dto.cpf !== undefined && dto.cpf !== null) {
				const cpf = Cpf.create(dto.cpf);
				const found = await customers.findByCpf(cpf.value);
				if (found && found.id.value !== existing.id.value) {
					throw new CustomerCpfAlreadyExistsError(cpf.value);
				}
			}

			const updatedCustomer = this.customerFactory.update(existing, {
				name: dto.name,
				email: dto.email,
				phone: dto.phone,
				cpf: dto.cpf,
			});

			return customers.update(updatedCustomer);
		});
	}
}

export { UpdateCustomerUseCase };
