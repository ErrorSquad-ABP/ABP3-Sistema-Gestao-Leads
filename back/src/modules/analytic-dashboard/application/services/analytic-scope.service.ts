import { Injectable } from '@nestjs/common';

import type { LeadAccessPolicy } from '../../../leads/application/services/lead-access-policy.service.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import type { AnalyticsScope } from '../../domain/repositories/analytic-dashboard.repository.js';

@Injectable()
class AnalyticScopeService {
	constructor(private readonly leadAccessPolicy: LeadAccessPolicy) {}

	async resolve(actor: LeadActor): Promise<AnalyticsScope> {
		const scope = await this.leadAccessPolicy.resolveCatalogScope(actor);

		if (scope.kind === 'full') {
			return { kind: 'full' };
		}

		if (scope.kind === 'attendant') {
			return {
				kind: 'attendant',
				actorUserId: scope.actorUserId,
				readStoreIds: [...scope.readStoreIds],
			};
		}

		if (scope.kind === 'manager') {
			return {
				kind: 'manager',
				actorUserId: scope.actorUserId,
				readTeamIds: [...scope.readTeamIds],
				readStoreIds: [...scope.readStoreIds],
			};
		}

		return {
			kind: 'general_manager',
			actorUserId: scope.actorUserId,
			readStoreIds: [...scope.readStoreIds],
		};
	}
}

export { AnalyticScopeService };
