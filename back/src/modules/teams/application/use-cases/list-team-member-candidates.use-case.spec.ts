import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
import { User } from '../../../users/domain/entities/user.entity.js';
import type { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import type { TeamAccessPolicy } from '../services/team-access-policy.service.js';
import { ListTeamMemberCandidatesUseCase } from './list-team-member-candidates.use-case.js';

const HASH =
	'$argon2id$v=19$m=65536,t=3,p=1$c29tZXNhbHQ$9q4FC2S7w6zV8nQ8PjM4Ww';

function user(id: string, name: string, email: string): User {
	return new User(
		Uuid.parse(id),
		Name.create(name),
		Email.create(email),
		PasswordHash.create(HASH),
		'ATTENDANT',
		[],
		[],
	);
}

describe('ListTeamMemberCandidatesUseCase', () => {
	it('busca no repositorio apenas usuarios elegiveis para a loja', async () => {
		const first = user(
			'11111111-1111-4111-8111-111111111111',
			'Ana Silva',
			'ana@example.com',
		);
		const second = user(
			'22222222-2222-4222-8222-222222222222',
			'Bruno Lima',
			'bruno@example.com',
		);
		let queriedStoreId: string | null = null;

		const useCase = new ListTeamMemberCandidatesUseCase(
			{
				assertCanUseStore: async () => {},
			} as unknown as TeamAccessPolicy,
			{
				create: () => ({
					create: async (candidate: User) => candidate,
					update: async (candidate: User) => candidate,
					delete: async () => {},
					findById: async () => null,
					findByEmail: async () => null,
					list: async () => [first, second],
					listTeamMemberCandidatesByStoreId: async (storeId: Uuid) => {
						queriedStoreId = storeId.value;
						return [first];
					},
					listByIds: async () => [],
					listPaged: async () => ({ users: [], total: 0 }),
				}),
			} as unknown as UserRepositoryFactory,
		);

		const result = await useCase.execute(
			{
				userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
				role: 'MANAGER',
			},
			'33333333-3333-4333-8333-333333333333',
		);

		assert.equal(queriedStoreId, '33333333-3333-4333-8333-333333333333');
		assert.deepEqual(result, [
			{
				id: first.id.value,
				name: 'Ana Silva',
				email: 'ana@example.com',
			},
		]);
	});
});
