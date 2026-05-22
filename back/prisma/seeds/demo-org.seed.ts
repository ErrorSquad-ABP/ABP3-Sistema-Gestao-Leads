import { UserRole } from '../../src/generated/prisma/enums.js';

import { buildMinimalSeed } from './minimal.seed.js';
import { deterministicUuid } from './seed-utils.js';
import type { SeedTeam, SeedUser } from './seed-definitions.js';

const DEMO_STORE_NAMES = [
	'Loja Jacareí',
	'Loja São José dos Campos',
	'Loja Caçapava',
	'Loja Taubaté',
	'Loja Pindamonhangaba',
] as const;

const DEMO_TEAM_NAMES = [
	'Equipe Jacareí',
	'Equipe SJC',
	'Equipe Caçapava',
	'Equipe Taubaté',
	'Equipe Pinda',
] as const;

export type DemoOrgDataset = Awaited<ReturnType<typeof buildDemoOrg>>;

export type DemoLeadOwner = Pick<SeedUser, 'id' | 'name' | 'email' | 'role'>;

export async function buildDemoOrg() {
	const minimal = await buildMinimalSeed();
	const users = minimal.users.filter(
		(user) => user.email !== 'atendente2@crm.com',
	);

	const admin = users.find((user) => user.role === UserRole.ADMIN);
	const generalManager = users.find(
		(user) => user.role === UserRole.GENERAL_MANAGER,
	);
	const manager = users.find((user) => user.role === UserRole.MANAGER);
	const attendant = users.find((user) => user.role === UserRole.ATTENDANT);

	if (!admin || !generalManager || !manager || !attendant) {
		throw new Error(
			'Seed demo incompleto: é necessário admin, gerente geral, gerente e atendente.',
		);
	}

	const stores = DEMO_STORE_NAMES.map((name, index) => ({
		id: deterministicUuid(`demo-store:${index + 1}`),
		name,
	}));
	const firstStore = stores[0];
	if (!firstStore) {
		throw new Error('Demo seed requires at least one store.');
	}

	const teams: SeedTeam[] = DEMO_TEAM_NAMES.map((name, index) => ({
		id: deterministicUuid(`demo-team:${index + 1}`),
		name,
		storeId: (stores[index] ?? firstStore).id,
		managerId: manager.id,
		memberIds: [manager.id, attendant.id],
	}));

	const leadOwners: DemoLeadOwner[] = [
		{
			id: attendant.id,
			name: attendant.name,
			email: attendant.email,
			role: attendant.role,
		},
		{
			id: manager.id,
			name: manager.name,
			email: manager.email,
			role: manager.role,
		},
	];

	const firstTeam = teams[0];
	if (!firstTeam) {
		throw new Error('Demo seed requires at least one team.');
	}

	const storePools = stores.map((store, index) => {
		const team = teams[index] ?? firstTeam;
		return {
			id: store.id,
			name: store.name,
			teamId: team.id,
			teamName: team.name,
			owners: leadOwners,
		};
	});

	return {
		accessGroups: minimal.accessGroups,
		users,
		stores,
		teams,
		leadOwners,
		storePools,
		accounts: {
			admin: { email: admin.email, role: admin.role },
			generalManager: {
				email: generalManager.email,
				role: generalManager.role,
			},
			manager: { email: manager.email, role: manager.role },
			attendant: { email: attendant.email, role: attendant.role },
		},
	};
}
