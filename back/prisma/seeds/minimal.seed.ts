import type {
	AccessGroup,
	Store,
	Team,
	User,
} from '../../src/generated/prisma/client.js';
import { UserRole } from '../../src/generated/prisma/enums.js';

import { deterministicUuid, hashPassword } from './seed-utils.js';

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? 'admin123';

const accessGroups = [
	{
		id: deterministicUuid('access-group:administrator'),
		name: 'Grupo administrativo',
		description: 'Administração completa do sistema, usuários e governança.',
		baseRole: UserRole.ADMIN,
		featureKeys: [
			'dashboardOperational',
			'dashboardAnalytic',
			'leads',
			'users',
			'profile',
			'credentials',
			'reports',
			'exports',
		],
		isSystemGroup: true,
	},
	{
		id: deterministicUuid('access-group:general-manager'),
		name: 'Grupo executivo',
		description: 'Visão consolidada de operação, indicadores e relatórios.',
		baseRole: UserRole.GENERAL_MANAGER,
		featureKeys: [
			'dashboardOperational',
			'dashboardAnalytic',
			'profile',
			'credentials',
			'reports',
			'exports',
		],
		isSystemGroup: true,
	},
	{
		id: deterministicUuid('access-group:manager'),
		name: 'Grupo de gestão',
		description: 'Supervisão operacional e acompanhamento comercial da equipe.',
		baseRole: UserRole.MANAGER,
		featureKeys: [
			'dashboardOperational',
			'dashboardAnalytic',
			'leads',
			'profile',
			'credentials',
			'reports',
		],
		isSystemGroup: true,
	},
	{
		id: deterministicUuid('access-group:attendant'),
		name: 'Grupo operacional',
		description: 'Execução comercial cotidiana e tratamento de leads.',
		baseRole: UserRole.ATTENDANT,
		featureKeys: ['leads', 'profile', 'credentials'],
		isSystemGroup: true,
	},
] satisfies Array<
	Pick<
		AccessGroup,
		'id' | 'name' | 'description' | 'baseRole' | 'featureKeys' | 'isSystemGroup'
	>
>;

export type MinimalSeedDataset = {
	accessGroups: Array<
		Pick<
			AccessGroup,
			| 'id'
			| 'name'
			| 'description'
			| 'baseRole'
			| 'featureKeys'
			| 'isSystemGroup'
		>
	>;
	teams: Array<Pick<Team, 'id' | 'name'>>;
	stores: Array<Pick<Store, 'id' | 'name'>>;
	users: Array<
		Pick<
			User,
			'id' | 'name' | 'email' | 'password' | 'role' | 'teamId' | 'accessGroupId'
		>
	>;
};

export async function buildMinimalSeed(): Promise<MinimalSeedDataset> {
	const passwordHash = await hashPassword(DEFAULT_PASSWORD);

	const teams = [
		{ id: deterministicUuid('team:equipe-demo'), name: 'Equipe Demo' },
		{ id: deterministicUuid('team:equipe-beta'), name: 'Equipe Beta' },
	];

	const stores = [
		{ id: deterministicUuid('store:loja-demo'), name: 'Loja Demo' },
		{ id: deterministicUuid('store:loja-beta'), name: 'Loja Beta' },
	];

	const [teamDemo, teamBeta] = teams;
	if (teamDemo === undefined || teamBeta === undefined) {
		throw new Error('Minimal seed: expected two teams');
	}
	const teamDemoId = teamDemo.id;
	const teamBetaId = teamBeta.id;

	const users = [
		{
			id: deterministicUuid('user:admin@crm.com'),
			name: 'Administrador',
			email: 'admin@crm.com',
			password: passwordHash,
			role: UserRole.ADMIN,
			teamId: null,
			accessGroupId: deterministicUuid('access-group:administrator'),
		},
		{
			id: deterministicUuid('user:geral@crm.com'),
			name: 'Gerente Geral',
			email: 'geral@crm.com',
			password: passwordHash,
			role: UserRole.GENERAL_MANAGER,
			teamId: null,
			accessGroupId: deterministicUuid('access-group:general-manager'),
		},
		{
			id: deterministicUuid('user:gerente@crm.com'),
			name: 'Gerente Equipe',
			email: 'gerente@crm.com',
			password: passwordHash,
			role: UserRole.MANAGER,
			teamId: teamDemoId,
			accessGroupId: deterministicUuid('access-group:manager'),
		},
		{
			id: deterministicUuid('user:atendente@crm.com'),
			name: 'Atendente Demo',
			email: 'atendente@crm.com',
			password: passwordHash,
			role: UserRole.ATTENDANT,
			teamId: teamDemoId,
			accessGroupId: deterministicUuid('access-group:attendant'),
		},
		{
			id: deterministicUuid('user:atendente2@crm.com'),
			name: 'Atendente Beta',
			email: 'atendente2@crm.com',
			password: passwordHash,
			role: UserRole.ATTENDANT,
			teamId: teamBetaId,
			accessGroupId: deterministicUuid('access-group:attendant'),
		},
	];

	return { accessGroups, teams, stores, users };
}
