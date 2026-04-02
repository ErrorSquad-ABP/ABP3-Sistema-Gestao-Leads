import { Inject, Injectable } from '@nestjs/common';

import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import type { CreateLeadDto } from '../dto/create-lead.dto.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { LeadFactory } from '../../domain/factories/lead.factory.js';
import { LeadInvalidCustomerError } from '../../domain/errors/lead-invalid-customer.error.js';
import { LeadInvalidOwnerError } from '../../domain/errors/lead-invalid-owner.error.js';
import { LeadInvalidStoreError } from '../../domain/errors/lead-invalid-store.error.js';
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import { CustomerRepositoryFactory } from '../../../customers/infrastructure/persistence/factories/customer-repository.factory.js';
import { StoreRepositoryFactory } from '../../../stores/infrastructure/persistence/factories/store-repository.factory.js';

@Injectable()
class CreateLeadUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly leadFactory: LeadFactory,
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly userRepositoryFactory: UserRepositoryFactory,
		private readonly customerRepositoryFactory: CustomerRepositoryFactory,
		private readonly storeRepositoryFactory: StoreRepositoryFactory,
	) {}

	async execute(dto: CreateLeadDto) {
		await this.unitOfWork.begin();
		try {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const users = this.userRepositoryFactory.create(transactionContext);
			const customers =
				this.customerRepositoryFactory.create(transactionContext);
			const stores = this.storeRepositoryFactory.create(transactionContext);
			const leads = this.leadRepositoryFactory.create(transactionContext);

			const customer = await customers.findById(dto.customerId);
			if (!customer) {
				throw new LeadInvalidCustomerError(dto.customerId);
			}

			const store = await stores.findById(dto.storeId);
			if (!store) {
				throw new LeadInvalidStoreError(dto.storeId);
			}

			if (dto.ownerUserId) {
				const owner = await users.findById(dto.ownerUserId);
				if (!owner) {
					throw new LeadInvalidOwnerError(dto.ownerUserId);
				}
			}

			const lead = this.leadFactory.create(dto);
			const created = await leads.create(lead);
			await this.unitOfWork.commit();
			return created;
		} catch (error) {
			await this.unitOfWork.rollback();
			throw error;
		}
	}
}

export { CreateLeadUseCase };
