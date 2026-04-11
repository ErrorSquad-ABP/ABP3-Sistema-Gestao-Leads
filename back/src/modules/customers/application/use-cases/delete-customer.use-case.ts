import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { CustomerRepositoryFactory } from '../../infrastructure/persistence/factories/customer-repository.factory.js';

@Injectable()
class DeleteCustomerUseCase {
	constructor(
		private readonly customerRepositoryFactory: CustomerRepositoryFactory,
	) {}

	async execute(id: string): Promise<void> {
		const repository = this.customerRepositoryFactory.create();
		await repository.delete(Uuid.parse(id));
	}
}

export { DeleteCustomerUseCase };
