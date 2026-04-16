import type {
	AccessGroup,
	Customer,
	Deal,
	Lead,
	Store,
	Team,
	User,
} from '../../src/generated/prisma/client.js';
import { UserRole } from '../../src/generated/prisma/enums.js';

import { deterministicUuid } from './seed-utils.js';

type SeedAccessGroup = Pick<
	AccessGroup,
	'id' | 'name' | 'description' | 'baseRole' | 'featureKeys' | 'isSystemGroup'
>;

type SeedStore = Pick<Store, 'id' | 'name'>;

type SeedUser = Pick<
	User,
	'id' | 'name' | 'email' | 'password' | 'role' | 'accessGroupId'
>;

type SeedTeam = Pick<Team, 'id' | 'name' | 'storeId' | 'managerId'> & {
	memberIds: string[];
};

type SeedCustomer = Pick<Customer, 'id' | 'name' | 'email' | 'phone' | 'cpf'>;

type SeedLead = Pick<
	Lead,
	| 'id'
	| 'customerId'
	| 'storeId'
	| 'ownerUserId'
	| 'source'
	| 'status'
	| 'createdAt'
	| 'updatedAt'
>;

type SeedDeal = Pick<
	Deal,
	| 'id'
	| 'leadId'
	| 'title'
	| 'value'
	| 'importance'
	| 'stage'
	| 'status'
	| 'closedAt'
	| 'createdAt'
	| 'updatedAt'
>;

type BaseSeedDataset = {
	accessGroups: SeedAccessGroup[];
	stores: SeedStore[];
	users: SeedUser[];
	teams: SeedTeam[];
};

type MinimalSeedDataset = BaseSeedDataset;

type DashboardSeedDataset = BaseSeedDataset & {
	customers: SeedCustomer[];
	leads: SeedLead[];
	deals: SeedDeal[];
};

const SYSTEM_ACCESS_GROUPS = [
	{
		id: deterministicUuid('access-group:administrator'),
		name: 'Grupo administrativo',
		description: 'Administracao completa do sistema, usuarios e governanca.',
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
		description: 'Visao consolidada de operacao, indicadores e relatorios.',
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
		name: 'Grupo de gestao',
		description: 'Supervisao operacional e acompanhamento comercial da equipe.',
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
		description: 'Execucao comercial cotidiana e tratamento de leads.',
		baseRole: UserRole.ATTENDANT,
		featureKeys: ['leads', 'profile', 'credentials'],
		isSystemGroup: true,
	},
] satisfies SeedAccessGroup[];

export {
	SYSTEM_ACCESS_GROUPS,
	type DashboardSeedDataset,
	type MinimalSeedDataset,
	type SeedTeam,
	type SeedUser,
};
