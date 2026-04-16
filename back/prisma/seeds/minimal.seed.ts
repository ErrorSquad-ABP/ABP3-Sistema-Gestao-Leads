import { UserRole } from '../../src/generated/prisma/enums.js';

import { deterministicUuid, hashPassword } from './seed-utils.js';
import {
	SYSTEM_ACCESS_GROUPS,
	type MinimalSeedDataset,
} from './seed-definitions.js';

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? 'admin123';

export async function buildMinimalSeed(): Promise<MinimalSeedDataset> {
	const passwordHash = await hashPassword(DEFAULT_PASSWORD);

	const storeDemoId = deterministicUuid('store:loja-demo');
	const storeBetaId = deterministicUuid('store:loja-beta');
	const teamDemoId = deterministicUuid('team:equipe-demo');
	const teamBetaId = deterministicUuid('team:equipe-beta');
	const adminId = deterministicUuid('user:admin@crm.com');
	const generalManagerId = deterministicUuid('user:geral@crm.com');
	const managerId = deterministicUuid('user:gerente@crm.com');
	const attendantId = deterministicUuid('user:atendente@crm.com');
	const betaAttendantId = deterministicUuid('user:atendente2@crm.com');

	const teams = [
		{
			id: teamDemoId,
			name: 'Equipe Demo',
			storeId: storeDemoId,
			managerId,
			memberIds: [managerId, attendantId],
		},
		{
			id: teamBetaId,
			name: 'Equipe Beta',
			storeId: storeBetaId,
			managerId: null,
			memberIds: [betaAttendantId],
		},
	];

	const stores = [
		{ id: storeDemoId, name: 'Loja Demo' },
		{ id: storeBetaId, name: 'Loja Beta' },
	];

	const users = [
		{
			id: adminId,
			name: 'Administrador',
			email: 'admin@crm.com',
			password: passwordHash,
			role: UserRole.ADMIN,
			accessGroupId: deterministicUuid('access-group:administrator'),
		},
		{
			id: generalManagerId,
			name: 'Gerente Geral',
			email: 'geral@crm.com',
			password: passwordHash,
			role: UserRole.GENERAL_MANAGER,
			accessGroupId: deterministicUuid('access-group:general-manager'),
		},
		{
			id: managerId,
			name: 'Gerente Equipe',
			email: 'gerente@crm.com',
			password: passwordHash,
			role: UserRole.MANAGER,
			accessGroupId: deterministicUuid('access-group:manager'),
		},
		{
			id: attendantId,
			name: 'Atendente Demo',
			email: 'atendente@crm.com',
			password: passwordHash,
			role: UserRole.ATTENDANT,
			accessGroupId: deterministicUuid('access-group:attendant'),
		},
		{
			id: betaAttendantId,
			name: 'Atendente Beta',
			email: 'atendente2@crm.com',
			password: passwordHash,
			role: UserRole.ATTENDANT,
			accessGroupId: deterministicUuid('access-group:attendant'),
		},
	];

	return { accessGroups: SYSTEM_ACCESS_GROUPS, teams, stores, users };
}
