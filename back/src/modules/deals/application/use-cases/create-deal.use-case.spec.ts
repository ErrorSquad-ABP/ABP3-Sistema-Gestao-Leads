import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Lead } from '../../../leads/domain/entities/lead.entity.js';
import { LeadSource } from '../../../../shared/domain/value-objects/lead-source.value-object.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import type { LeadAccessPolicy } from '../../../leads/application/services/lead-access-policy.service.js';
import { ActiveDealAlreadyExistsError } from '../../domain/errors/active-deal-already-exists.error.js';
import { DealVehicleNotAvailableError } from '../../domain/errors/deal-vehicle-not-available.error.js';
import { DealFactory } from '../../domain/factories/deal.factory.js';
import type { IDealRepository } from '../../domain/repositories/deal.repository.js';
import type { IDealHistoryRepository } from '../../domain/repositories/deal-history.repository.js';
import { CreateDealUseCase } from './create-deal.use-case.js';
import type { IVehicleRepository } from '../../../vehicles/domain/repositories/vehicle.repository.js';
import { VehicleFactory } from '../../../vehicles/domain/factories/vehicle.factory.js';

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
		const vehicleId = Uuid.generate();
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
			vehicleId: vehicleId.value,
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
			async findByIdEnriched() {
				return null;
			},
			async findOpenByLeadId() {
				return existingDeal;
			},
			async findOpenByVehicleId() {
				return null;
			},
			async listByLeadId() {
				return [];
			},
			async listByLeadIdEnriched() {
				return [];
			},
			async listScoped() {
				return { items: [], page: 1, limit: 20, total: 0, totalPages: 0 };
			},
			async listScopedEnriched() {
				return { items: [], page: 1, limit: 20, total: 0, totalPages: 0 };
			},
			async listPipelineStagesEnriched() {
				return [];
			},
			async listPipelineStageEnriched() {
				return {
					stage: 'INITIAL_CONTACT',
					items: [],
					page: 1,
					limit: 20,
					total: 0,
					totalPages: 0,
					totalValue: null,
				};
			},
		};

		const vehicles: IVehicleRepository = {
			async create(v) {
				return v;
			},
			async update(v) {
				return v;
			},
			async delete() {},
			async findById() {
				return null;
			},
			async countDealsByVehicleId() {
				return 0;
			},
			async list() {
				return [];
			},
			async listCatalog() {
				return {
					items: [],
					summary: {
						total: 0,
						available: 0,
						reserved: 0,
						sold: 0,
						inactive: 0,
						highInterest: 0,
					},
					page: 1,
					limit: 8,
					total: 0,
					totalPages: 1,
				};
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

		const vehicleRepoFactory = {
			create: () => vehicles,
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
			vehicleRepoFactory as never,
		);

		(uc as unknown as { unitOfWork: IUnitOfWork }).unitOfWork =
			new FakeUnitOfWork();

		await assert.rejects(
			() =>
				uc.execute(actor, leadId.value, {
					vehicleId: vehicleId.value,
					title: 'Nova',
					value: null,
				}),
			ActiveDealAlreadyExistsError,
		);
	});

	it('throws when the selected vehicle is reserved', async () => {
		const leadId = Uuid.generate();
		const storeId = Uuid.generate();
		const vehicleId = Uuid.generate();
		const lead = new Lead(
			leadId,
			Uuid.generate(),
			storeId,
			null,
			LeadSource.create('other'),
			'NEW',
		);
		const reservedVehicle = new VehicleFactory().create({
			storeId: storeId.value,
			brand: 'Jeep',
			model: 'Renegade',
			modelYear: 2024,
			mileage: 10_000,
			supportedFuelType: 'FLEX',
			price: '120000.00',
			status: 'RESERVED',
		});

		const leads = {
			async findById() {
				return lead;
			},
		};

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
			async findByIdEnriched() {
				return null;
			},
			async findOpenByLeadId() {
				return null;
			},
			async findOpenByVehicleId() {
				return null;
			},
			async listByLeadId() {
				return [];
			},
			async listByLeadIdEnriched() {
				return [];
			},
			async listScoped() {
				return { items: [], page: 1, limit: 20, total: 0, totalPages: 0 };
			},
			async listScopedEnriched() {
				return { items: [], page: 1, limit: 20, total: 0, totalPages: 0 };
			},
			async listPipelineStagesEnriched() {
				return [];
			},
			async listPipelineStageEnriched() {
				return {
					stage: 'INITIAL_CONTACT',
					items: [],
					page: 1,
					limit: 20,
					total: 0,
					totalPages: 0,
					totalValue: null,
				};
			},
		};

		const vehicles: IVehicleRepository = {
			async create(v) {
				return v;
			},
			async update(v) {
				return v;
			},
			async delete() {},
			async findById() {
				return reservedVehicle;
			},
			async countDealsByVehicleId() {
				return 0;
			},
			async list() {
				return [];
			},
			async listCatalog() {
				return {
					items: [],
					summary: {
						total: 0,
						available: 0,
						reserved: 0,
						sold: 0,
						inactive: 0,
						highInterest: 0,
					},
					page: 1,
					limit: 8,
					total: 0,
					totalPages: 1,
				};
			},
		};

		const history: IDealHistoryRepository = {
			async appendMany() {},
			async listByDealId() {
				return [];
			},
		};

		const uc = new CreateDealUseCase(
			new DealFactory(),
			{ create: () => deals } as never,
			{ create: () => history } as never,
			{ create: () => leads } as never,
			{
				async assertCanMutateLead() {},
				async assertCanReadLead() {},
			} as unknown as LeadAccessPolicy,
			{ create: () => vehicles } as never,
		);

		(uc as unknown as { unitOfWork: IUnitOfWork }).unitOfWork =
			new FakeUnitOfWork();

		await assert.rejects(
			() =>
				uc.execute(actor, leadId.value, {
					vehicleId: vehicleId.value,
					title: 'Nova',
					value: null,
				}),
			DealVehicleNotAvailableError,
		);
	});
});
