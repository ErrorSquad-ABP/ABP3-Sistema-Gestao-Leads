import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';

@Injectable()
class ListTeamLeadsUseCase {
	constructor(private readonly leadRepositoryFactory: LeadRepositoryFactory) {}

	execute(teamId: string) {
		const leads = this.leadRepositoryFactory.create();
		return leads.listByTeam(Uuid.parse(teamId));
	}
}

export { ListTeamLeadsUseCase };
