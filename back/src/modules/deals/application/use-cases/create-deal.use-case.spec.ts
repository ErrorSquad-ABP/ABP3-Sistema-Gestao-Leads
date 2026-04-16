import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Lead } from '../../../leads/domain/entities/lead.entity.js';
import { LeadSource } from '../../../../shared/domain/value-objects/lead-source.value-object.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import type { LeadAccessPolicy } from '../../../leads/application/services/lead-access-policy.service.js';
import { ActiveDealAlreadyExistsError } from '../../domain/errors/active-deal-already-exists.error.js';
import { DealFactory } from '../../domain/factories/deal.factory.js';
import type { IDealRepository } from '../../domain/repositories/deal.repository.js';
import type { IDealHistoryRepository } from '../../domain/repositories/deal-history.repository.js';
import { CreateDealUseCase } from './create-deal.use-case.js';

const actor: LeadActor = {
	userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
	role: 'ADMINISTRATOR',
};

class FakeUnitOfWork implements IUnitOfWork {
	async run<T>(fn: () => Promise<T>): Promise<T> {
		return fn();
	}

	async begin(): Promise<void> {}

	async commit(): Promise<void> {}

	async rollback(): Promise<void> {}

	getTransactionContext() {
		return { client: {} };
	}
}

describe('CreateDealUseCase', () => {
	it('throws when an open deal already exists for the lead', async () => {
		const leadId = Uuid.generate();
		const lead = new Lead(
			leadId,
			Uuid.generate(),
			Uuid.generate(),
			null,
			LeadSource.create('other'),
			'NEW',
		);

		const leads = {
			async findById() {
				return lead;
			},
		};

		const existingDeal = new DealFactory().create({
			leadId: leadId.value,
			title: 'X',
			value: null,
		});

		const deals: IDealRepository = {
			async create(d) {
				return d;
			},
			async update(d) {
				return d;
			},
			async delete() {},
			async findById() {
				return null;
			},
			async findOpenByLeadId() {
				return existingDeal;
			},
			async listByLeadId() {
				return [];
			},
		};

		const history: IDealHistoryRepository = {
			async appendMany() {},
			async listByDealId() {
				return [];
			},
		};

		const leadRepoFactory = {
			create: () => leads,
		};

		const dealRepoFactory = {
			create: () => deals,
		};

		const historyRepoFactory = {
			create: () => history,
		};

		const policy = {
			async assertCanMutateLead() {},
			async assertCanReadLead() {},
		} as unknown as LeadAccessPolicy;

		const uc = new CreateDealUseCase(
			new DealFactory(),
			dealRepoFactory as never,
			historyRepoFactory as never,
			leadRepoFactory as never,
			policy,
		);

		(uc as unknown as { unitOfWork: IUnitOfWork }).unitOfWork =
			new FakeUnitOfWork();

		await assert.rejects(
			() =>
				uc.execute(actor, leadId.value, {
					title: 'Nova',
					value: null,
				}),
			ActiveDealAlreadyExistsError,
		);
	});
});
