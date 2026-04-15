import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { DomainValidationError } from '../../../../shared/domain/errors/domain-validation.error.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';
import { CustomerEmailAlreadyExistsError } from '../../domain/errors/customer-email-already-exists.error.js';
import { CustomerCpfAlreadyExistsError } from '../../domain/errors/customer-cpf-already-exists.error.js';
import { Customer } from '../../domain/entities/customer.entity.js';
// biome-ignore lint/style/useImportType: Nest DI
import { CustomerRepositoryFactory } from '../../infrastructure/persistence/factories/customer-repository.factory.js';
import type { UpdateCustomerDto } from '../dto/update-customer.dto.js';

function hasCustomerUpdatePayload(dto: UpdateCustomerDto): boolean {
	return (
		dto.name !== undefined ||
		dto.email !== undefined ||
		dto.phone !== undefined ||
		dto.cpf !== undefined
	);
}

@Injectable()
class UpdateCustomerUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly customerRepositoryFactory: CustomerRepositoryFactory,
	) {}

	async execute(customerId: string, dto: UpdateCustomerDto) {
		if (!hasCustomerUpdatePayload(dto)) {
			throw new DomainValidationError(
				'Informe ao menos um campo para atualizar o cliente.',
				{ code: 'customer.update.no_fields' },
			);
		}

		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const customers =
				this.customerRepositoryFactory.create(transactionContext);

			const idVo = Uuid.parse(customerId);
			const existing = await customers.findById(idVo);
			if (!existing) {
				throw new CustomerNotFoundError(customerId);
			}

			if (dto.email !== undefined && dto.email !== null) {
				const nextEmail = Email.create(dto.email);
				if (existing.email === null || !nextEmail.equals(existing.email)) {
					const other = await customers.findByEmail(nextEmail.value);
					if (other && !other.id.equals(existing.id)) {
						throw new CustomerEmailAlreadyExistsError(nextEmail.value);
					}
				}
			}

			if (dto.cpf !== undefined && dto.cpf !== null) {
				const existing_cpf = await customers.findByCpf(dto.cpf);
				if (existing_cpf && !existing_cpf.id.equals(existing.id)) {
					throw new CustomerCpfAlreadyExistsError(dto.cpf);
				}
			}

			const updated = existing.withUpdates({
				name: dto.name,
				email: dto.email,
				phone: dto.phone,
				cpf: dto.cpf,
			});

			if (Customer.sameState(existing, updated)) {
				return existing;
			}

			return customers.update(updated);
		});
	}
}

export { UpdateCustomerUseCase };
