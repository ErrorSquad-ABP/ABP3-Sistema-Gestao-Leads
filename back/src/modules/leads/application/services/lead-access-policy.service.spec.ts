import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
import { Team } from '../../../teams/domain/entities/team.entity.js';
import type { ITeamRepository } from '../../../teams/domain/repositories/team.repository.js';
import { User } from '../../../users/domain/entities/user.entity.js';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.js';
import { LeadAccessDeniedError } from '../../domain/errors/lead-access-denied.error.js';
import { LeadAccessPolicy } from './lead-access-policy.service.js';

const VALID_ARGON2_FIXTURE =
	'$argon2id$v=19$m=19456,t=2,p=1$H5K4T/9lCdJ1rPy/qic1Iw$FxSLF4hsA96bMKbhvKfu/V2rNzhVOH9YGJdkYyqbyXA';

const ACTOR_ID = '00000000-0000-4000-8000-0000000000a1';
const OWNER_OTHER_ID = '00000000-0000-4000-8000-0000000000d1';
const TEAM_A = '00000000-0000-4000-8000-0000000000b1';
const TEAM_B = '00000000-0000-4000-8000-0000000000b2';
const STORE_ID = '00000000-0000-4000-8000-0000000000c1';

function userFixture(params: {
	readonly id: string;
	readonly role: 'ATTENDANT' | 'MANAGER' | 'GENERAL_MANAGER' | 'ADMINISTRATOR';
	readonly memberTeamIds: readonly string[];
	readonly managedTeamIds: readonly string[];
}): User {
	return new User(
		Uuid.parse(params.id),
		Name.create('Test User'),
		Email.create('user@example.com'),
		PasswordHash.create(VALID_ARGON2_FIXTURE),
		params.role,
		params.memberTeamIds.map((id) => Uuid.parse(id)),
		params.managedTeamIds.map((id) => Uuid.parse(id)),
	);
}

function teamFixture(teamId: string, storeId: string): Team {
	return new Team(
		Uuid.parse(teamId),
		Name.create('Equipe'),
		Uuid.parse(storeId),
		null,
		[],
		null,
		'persistence',
	);
}

function teamRepoListingStore(storeId: string): ITeamRepository {
	return {
		create: async () => {
			throw new Error('not used');
		},
		update: async () => {
			throw new Error('not used');
		},
		delete: async () => {
			throw new Error('not used');
		},
		findById: async () => null,
		listByIds: async (ids) => ids.map((id) => teamFixture(id.value, storeId)),
		list: async () => [],
	};
}

function userRepoWithUsers(users: readonly User[]): IUserRepository {
	const byId = new Map(users.map((u) => [u.id.value, u]));
	return {
		create: async () => {
			throw new Error('not used');
		},
		update: async () => {
			throw new Error('not used');
		},
		delete: async () => {
			throw new Error('not used');
		},
		findById: async (id) => byId.get(id.value) ?? null,
		findByEmail: async () => null,
		listByIds: async (ids) =>
			ids
				.map((id) => byId.get(id.value) ?? null)
				.filter((user): user is User => user !== null),
		listPaged: async () => ({ users: [], total: 0 }),
	};
}

function policyFor(actor: User, extraUsers: readonly User[] = []) {
	return new LeadAccessPolicy(
		{
			create: () => userRepoWithUsers([actor, ...extraUsers]),
		} as never,
		{
			create: () => teamRepoListingStore(STORE_ID),
		} as never,
	);
}

describe('LeadAccessPolicy.assertCanListAllLeads', () => {
	const policy = new LeadAccessPolicy(
		{ create: () => ({}) } as never,
		{ create: () => ({}) } as never,
	);

	it('permite ADMINISTRATOR', async () => {
		await policy.assertCanListAllLeads({
			userId: '00000000-0000-4000-8000-000000000001',
			role: 'ADMINISTRATOR',
		});
	});

	it('rejeita GENERAL_MANAGER', async () => {
		await assert.rejects(
			() =>
				policy.assertCanListAllLeads({
					userId: '00000000-0000-4000-8000-000000000002',
					role: 'GENERAL_MANAGER',
				}),
			LeadAccessDeniedError,
		);
	});

	it('rejeita MANAGER', async () => {
		await assert.rejects(
			() =>
				policy.assertCanListAllLeads({
					userId: '00000000-0000-4000-8000-000000000003',
					role: 'MANAGER',
				}),
			LeadAccessDeniedError,
		);
	});

	it('rejeita ATTENDANT', async () => {
		await assert.rejects(
			() =>
				policy.assertCanListAllLeads({
					userId: '00000000-0000-4000-8000-000000000004',
					role: 'ATTENDANT',
				}),
			LeadAccessDeniedError,
		);
	});
});

describe('LeadAccessPolicy.assertCanListTeam', () => {
	it('permite MANAGER quando a equipe esta em memberTeamIds', async () => {
		const actor = userFixture({
			id: ACTOR_ID,
			role: 'MANAGER',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const policy = policyFor(actor);
		await policy.assertCanListTeam(
			{ userId: ACTOR_ID, role: 'MANAGER' },
			TEAM_A,
		);
	});

	it('permite MANAGER quando a equipe esta apenas em managedTeamIds', async () => {
		const actor = userFixture({
			id: ACTOR_ID,
			role: 'MANAGER',
			memberTeamIds: [],
			managedTeamIds: [TEAM_B],
		});
		const policy = policyFor(actor);
		await policy.assertCanListTeam(
			{ userId: ACTOR_ID, role: 'MANAGER' },
			TEAM_B,
		);
	});

	it('rejeita MANAGER para equipe fora do escopo', async () => {
		const actor = userFixture({
			id: ACTOR_ID,
			role: 'MANAGER',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const policy = policyFor(actor);
		await assert.rejects(
			() =>
				policy.assertCanListTeam({ userId: ACTOR_ID, role: 'MANAGER' }, TEAM_B),
			LeadAccessDeniedError,
		);
	});

	it('rejeita ATTENDANT', async () => {
		const actor = userFixture({
			id: ACTOR_ID,
			role: 'ATTENDANT',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const policy = policyFor(actor);
		await assert.rejects(
			() =>
				policy.assertCanListTeam(
					{ userId: ACTOR_ID, role: 'ATTENDANT' },
					TEAM_A,
				),
			LeadAccessDeniedError,
		);
	});

	it('permite ADMINISTRATOR para qualquer equipe (escopo completo)', async () => {
		const policy = new LeadAccessPolicy(
			{ create: () => ({}) } as never,
			{ create: () => ({}) } as never,
		);
		await policy.assertCanListTeam(
			{ userId: ACTOR_ID, role: 'ADMINISTRATOR' },
			TEAM_B,
		);
	});
});

describe('LeadAccessPolicy.assertCanListOwner', () => {
	it('permite ATTENDANT apenas para o proprio id', async () => {
		const actor = userFixture({
			id: ACTOR_ID,
			role: 'ATTENDANT',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const policy = policyFor(actor);
		await policy.assertCanListOwner(
			{ userId: ACTOR_ID, role: 'ATTENDANT' },
			ACTOR_ID,
		);
	});

	it('rejeita ATTENDANT para outro proprietario', async () => {
		const actor = userFixture({
			id: ACTOR_ID,
			role: 'ATTENDANT',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const policy = policyFor(actor);
		await assert.rejects(
			() =>
				policy.assertCanListOwner(
					{ userId: ACTOR_ID, role: 'ATTENDANT' },
					OWNER_OTHER_ID,
				),
			LeadAccessDeniedError,
		);
	});

	it('permite MANAGER quando o proprietario partilha equipa de leitura', async () => {
		const actor = userFixture({
			id: ACTOR_ID,
			role: 'MANAGER',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const owner = userFixture({
			id: OWNER_OTHER_ID,
			role: 'ATTENDANT',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const policy = policyFor(actor, [owner]);
		await policy.assertCanListOwner(
			{ userId: ACTOR_ID, role: 'MANAGER' },
			OWNER_OTHER_ID,
		);
	});

	it('permite MANAGER quando a interseção vem de managedTeamIds do proprietario', async () => {
		const actor = userFixture({
			id: ACTOR_ID,
			role: 'MANAGER',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const owner = userFixture({
			id: OWNER_OTHER_ID,
			role: 'MANAGER',
			memberTeamIds: [],
			managedTeamIds: [TEAM_A],
		});
		const policy = policyFor(actor, [owner]);
		await policy.assertCanListOwner(
			{ userId: ACTOR_ID, role: 'MANAGER' },
			OWNER_OTHER_ID,
		);
	});

	it('rejeita MANAGER quando nao ha equipas em comum com o proprietario', async () => {
		const actor = userFixture({
			id: ACTOR_ID,
			role: 'MANAGER',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const owner = userFixture({
			id: OWNER_OTHER_ID,
			role: 'ATTENDANT',
			memberTeamIds: [TEAM_B],
			managedTeamIds: [],
		});
		const policy = policyFor(actor, [owner]);
		await assert.rejects(
			() =>
				policy.assertCanListOwner(
					{ userId: ACTOR_ID, role: 'MANAGER' },
					OWNER_OTHER_ID,
				),
			LeadAccessDeniedError,
		);
	});

	it('permite GENERAL_MANAGER quando o proprietario partilha equipa de leitura', async () => {
		const actor = userFixture({
			id: ACTOR_ID,
			role: 'GENERAL_MANAGER',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const owner = userFixture({
			id: OWNER_OTHER_ID,
			role: 'ATTENDANT',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const policy = policyFor(actor, [owner]);
		await policy.assertCanListOwner(
			{ userId: ACTOR_ID, role: 'GENERAL_MANAGER' },
			OWNER_OTHER_ID,
		);
	});

	it('rejeita GENERAL_MANAGER quando nao ha equipas em comum com o proprietario', async () => {
		const actor = userFixture({
			id: ACTOR_ID,
			role: 'GENERAL_MANAGER',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const owner = userFixture({
			id: OWNER_OTHER_ID,
			role: 'ATTENDANT',
			memberTeamIds: [TEAM_B],
			managedTeamIds: [],
		});
		const policy = policyFor(actor, [owner]);
		await assert.rejects(
			() =>
				policy.assertCanListOwner(
					{ userId: ACTOR_ID, role: 'GENERAL_MANAGER' },
					OWNER_OTHER_ID,
				),
			LeadAccessDeniedError,
		);
	});
});

describe('LeadAccessPolicy.batchCanMutateLeadSnapshots', () => {
	it('ADMINISTRATOR marca todos como mutaveis', async () => {
		const policy = new LeadAccessPolicy(
			{ create: () => ({}) } as never,
			{ create: () => ({}) } as never,
		);
		const out = await policy.batchCanMutateLeadSnapshots(
			{ userId: ACTOR_ID, role: 'ADMINISTRATOR' },
			[
				{ storeId: STORE_ID, ownerUserId: OWNER_OTHER_ID },
				{ storeId: '00000000-0000-4000-8000-0000000000c2', ownerUserId: null },
			],
		);
		assert.deepEqual(out, [true, true]);
	});

	it('ATTENDANT so muta proprio ownerUserId', async () => {
		const actor = userFixture({
			id: ACTOR_ID,
			role: 'ATTENDANT',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const policy = policyFor(actor);
		const out = await policy.batchCanMutateLeadSnapshots(
			{ userId: ACTOR_ID, role: 'ATTENDANT' },
			[
				{ storeId: STORE_ID, ownerUserId: ACTOR_ID },
				{ storeId: STORE_ID, ownerUserId: OWNER_OTHER_ID },
			],
		);
		assert.deepEqual(out, [true, false]);
	});

	it('MANAGER pode mutar lead sem dono na loja gerida', async () => {
		const actor = userFixture({
			id: ACTOR_ID,
			role: 'MANAGER',
			memberTeamIds: [],
			managedTeamIds: [TEAM_A],
		});
		const policy = policyFor(actor);
		const out = await policy.batchCanMutateLeadSnapshots(
			{ userId: ACTOR_ID, role: 'MANAGER' },
			[{ storeId: STORE_ID, ownerUserId: null }],
		);
		assert.deepEqual(out, [true]);
	});

	it('MANAGER pode mutar lead de outro quando equipas geridas intersectam', async () => {
		const actor = userFixture({
			id: ACTOR_ID,
			role: 'MANAGER',
			memberTeamIds: [],
			managedTeamIds: [TEAM_A],
		});
		const owner = userFixture({
			id: OWNER_OTHER_ID,
			role: 'ATTENDANT',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const policy = policyFor(actor, [owner]);
		const out = await policy.batchCanMutateLeadSnapshots(
			{ userId: ACTOR_ID, role: 'MANAGER' },
			[
				{ storeId: STORE_ID, ownerUserId: OWNER_OTHER_ID },
				{ storeId: STORE_ID, ownerUserId: OWNER_OTHER_ID },
			],
		);
		assert.deepEqual(out, [true, true]);
	});

	it('GENERAL_MANAGER nao muta lead de outro usuario', async () => {
		const actor = userFixture({
			id: ACTOR_ID,
			role: 'GENERAL_MANAGER',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const owner = userFixture({
			id: OWNER_OTHER_ID,
			role: 'ATTENDANT',
			memberTeamIds: [TEAM_A],
			managedTeamIds: [],
		});
		const policy = policyFor(actor, [owner]);
		const out = await policy.batchCanMutateLeadSnapshots(
			{ userId: ACTOR_ID, role: 'GENERAL_MANAGER' },
			[{ storeId: STORE_ID, ownerUserId: OWNER_OTHER_ID }],
		);
		assert.deepEqual(out, [false]);
	});
});
