import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { LeadAccessPolicy } from '../services/lead-access-policy.service.js';
import type { LeadActor } from '../types/lead-actor.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';

@Injectable()
class ListOwnLeadsUseCase {
	constructor(
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	async execute(actor: LeadActor, ownerUserId: string) {
		await this.leadAccessPolicy.assertCanListOwner(actor, ownerUserId);
		const leads = this.leadRepositoryFactory.create();
		return leads.listByOwner(Uuid.parse(ownerUserId));
	}
}

export { ListOwnLeadsUseCase };
