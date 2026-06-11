import { ForbiddenException, Injectable } from '@nestjs/common';

import type { LeadActor } from '../../../leads/application/types/lead-actor.js';

@Injectable()
class AgendaAccessPolicy {
	resolveListUserId(
		actor: LeadActor,
		ownerUserId?: string,
	): string | undefined {
		if (actor.role === 'ADMINISTRATOR') {
			return ownerUserId;
		}
		if (ownerUserId && ownerUserId !== actor.userId) {
			throw new ForbiddenException(
				'Filtro por usuário permitido apenas para administrador.',
			);
		}
		return actor.userId;
	}

	resolveMetricsUserId(actor: LeadActor): string | undefined {
		if (actor.role === 'ADMINISTRATOR') {
			return undefined;
		}
		return actor.userId;
	}

	assertCanManageItem(actor: LeadActor, ownerUserId: string): void {
		if (actor.role === 'ADMINISTRATOR') {
			return;
		}
		if (actor.userId !== ownerUserId) {
			throw new ForbiddenException(
				'Sem permissão para alterar item de outro usuário.',
			);
		}
	}

	shouldIncludeOwner(actor: LeadActor): boolean {
		return actor.role === 'ADMINISTRATOR';
	}
}

export { AgendaAccessPolicy };
