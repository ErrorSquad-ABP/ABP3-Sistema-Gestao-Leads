import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { Store } from '../../../stores/domain/entities/store.entity.js';
import type { IStoreRepository } from '../../../stores/domain/repositories/store.repository.js';
import { User } from '../../../users/domain/entities/user.entity.js';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
import { TeamInvalidStoreError } from '../../domain/errors/team-invalid-store.error.js';
import { TeamFactory } from '../../domain/factories/team.factory.js';
import type { ITeamRepository } from '../../domain/repositories/team.repository.js';
import type { TeamRepositoryFactory } from '../../infrastructure/persistence/factories/team-repository.factory.js';
import type { StoreRepositoryFactory } from '../../../stores/infrastructure/persistence/factories/store-repository.factory.js';
import type { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import { CreateTeamUseCase } from './create-team.use-case.js';

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

const SAMPLE_HASH =
	'$argon2id$v=19$m=65536,t=3,p=1$c29tZXNhbHQ$9q4FC2S7w6zV8nQ8PjM4Ww';

function buildManager(): User {
	return new User(
		Uuid.parse('11111111-1111-4111-8111-111111111111'),
		Name.create('Gerente Comercial'),
		Email.create('gerente@example.com'),
		PasswordHash.create(SAMPLE_HASH),
		'MANAGER',
		null,
	);
}

function buildStore(): Store {
	return new Store(
		Uuid.parse('22222222-2222-4222-8222-222222222222'),
		Name.create('Loja Centro'),
	);
}

describe('CreateTeamUseCase', () => {
	it('cria equipe com storeId quando a loja existe', async () => {
		let createdTeam: Awaited<ReturnType<ITeamRepository['create']>> | undefined;
		const store = buildStore();
		const manager = buildManager();

		const teams: ITeamRepository = {
			async create(team) {
				createdTeam = team;
				return team;
			},
			async update(team) {
				return team;
			},
			async delete() {},
			async findById() {
				return null;
			},
			async list() {
				return [];
			},
		};

		const stores: IStoreRepository = {
			async create(entity) {
				return entity;
			},
			async update(entity) {
				return entity;
			},
			async delete() {},
			async findById(id) {
				return id.equals(store.id) ? store : null;
			},
			async list() {
				return [store];
			},
		};

		const users: IUserRepository = {
			async create(user) {
				return user;
			},
			async update(user) {
				return user;
			},
			async delete() {},
			async findById(id) {
				return id.equals(manager.id) ? manager : null;
			},
			async findByEmail() {
				return null;
			},
			async listPaged() {
				return { users: [], total: 0 };
			},
		};

		const useCase = new CreateTeamUseCase(
			new TeamFactory(),
			{ create: () => teams } as TeamRepositoryFactory,
			{ create: () => stores } as StoreRepositoryFactory,
			{ create: () => users } as UserRepositoryFactory,
		);
		(useCase as unknown as { unitOfWork: IUnitOfWork }).unitOfWork =
			new FakeUnitOfWork();

		const result = await useCase.execute({
			name: 'Equipe Loja Centro',
			managerId: manager.id.value,
			storeId: store.id.value,
		});

		assert.equal(result.storeId?.value, store.id.value);
		assert.equal(createdTeam?.storeId?.value, store.id.value);
		assert.equal(result.managerId?.value, manager.id.value);
	});

	it('rejeita criacao quando storeId nao existe', async () => {
		const manager = buildManager();

		const useCase = new CreateTeamUseCase(
			new TeamFactory(),
			{
				create: () =>
					({
						async create(team) {
							return team;
						},
						async update(team) {
							return team;
						},
						async delete() {},
						async findById() {
							return null;
						},
						async list() {
							return [];
						},
					}) as ITeamRepository,
			} as TeamRepositoryFactory,
			{
				create: () =>
					({
						async create(store) {
							return store;
						},
						async update(store) {
							return store;
						},
						async delete() {},
						async findById() {
							return null;
						},
						async list() {
							return [];
						},
					}) as IStoreRepository,
			} as StoreRepositoryFactory,
			{
				create: () =>
					({
						async create(user) {
							return user;
						},
						async update(user) {
							return user;
						},
						async delete() {},
						async findById(id) {
							return id.equals(manager.id) ? manager : null;
						},
						async findByEmail() {
							return null;
						},
						async listPaged() {
							return { users: [], total: 0 };
						},
					}) as IUserRepository,
			} as UserRepositoryFactory,
		);
		(useCase as unknown as { unitOfWork: IUnitOfWork }).unitOfWork =
			new FakeUnitOfWork();

		await assert.rejects(
			() =>
				useCase.execute({
					name: 'Equipe sem Loja',
					managerId: manager.id.value,
					storeId: '33333333-3333-4333-8333-333333333333',
				}),
			(error: unknown) => error instanceof TeamInvalidStoreError,
		);
	});
});
