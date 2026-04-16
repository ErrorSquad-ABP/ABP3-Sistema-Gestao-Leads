import type { Uuid } from '../../../../shared/domain/types/identifiers.js';
import type { Deal } from '../entities/deal.entity.js';

interface IDealRepository {
	create(deal: Deal): Promise<Deal>;
	update(deal: Deal): Promise<Deal>;
	delete(id: Uuid): Promise<void>;
	findById(id: Uuid): Promise<Deal | null>;
	findOpenByLeadId(leadId: Uuid): Promise<Deal | null>;
	listByLeadId(leadId: Uuid): Promise<readonly Deal[]>;
}

export type { IDealRepository };
