import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';

@Injectable()
class ListOwnLeadsUseCase {
	constructor(private readonly leadRepositoryFactory: LeadRepositoryFactory) {}

	execute(ownerUserId: string) {
		const leads = this.leadRepositoryFactory.create();
		return leads.listByOwner(ownerUserId);
	}
}

export { ListOwnLeadsUseCase };
