import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type {
	AccessFeatureKey,
	AccessGroupSummary,
	UserRole,
} from '@/features/login/types/login.types';

import { hasFeatureAccess } from './permissions';

function buildGroup(
	overrides: Partial<AccessGroupSummary> & { featureKeys: AccessFeatureKey[] },
): AccessGroupSummary {
	return {
		id: overrides.id ?? 'c0a8012e-0000-4000-8000-000000000001',
		name: overrides.name ?? 'Grupo',
		description: overrides.description ?? 'Grupo de teste',
		baseRole: overrides.baseRole ?? null,
		featureKeys: overrides.featureKeys,
		isSystemGroup: overrides.isSystemGroup ?? false,
	};
}

function buildUser(options: {
	role: UserRole;
	groups?: AccessGroupSummary[];
	featureKeys?: AccessFeatureKey[];
	legacyGroup?: AccessGroupSummary | null;
}) {
	const groups = options.groups ?? [];
	return {
		role: options.role,
		accessGroups: groups,
		featureKeys:
			options.featureKeys ??
			Array.from(new Set(groups.flatMap((group) => group.featureKeys))),
		accessGroup: options.legacyGroup ?? groups[0] ?? null,
	};
}

describe('autorização por união de features (multi-grupo, sem herança)', () => {
	it('usuário acessa módulo liberado por qualquer um dos seus grupos', () => {
		const user = buildUser({
			role: 'ADMINISTRATOR',
			groups: [
				buildGroup({ name: 'Dashboards', featureKeys: ['dashboardAnalytic'] }),
				buildGroup({
					id: 'c0a8012e-0000-4000-8000-000000000002',
					name: 'Gestão de acessos',
					featureKeys: ['users'],
				}),
			],
		});

		assert.equal(hasFeatureAccess(user, 'users'), true);
		assert.equal(hasFeatureAccess(user, 'dashboardAnalytic'), true);
	});

	it('feature ausente em todos os grupos permanece bloqueada — grupo não herda nada', () => {
		const user = buildUser({
			role: 'ADMINISTRATOR',
			groups: [
				buildGroup({ name: 'Dashboards', featureKeys: ['dashboardAnalytic'] }),
				buildGroup({
					id: 'c0a8012e-0000-4000-8000-000000000002',
					name: 'Gestão de acessos',
					featureKeys: ['users'],
				}),
			],
		});

		assert.equal(hasFeatureAccess(user, 'leads'), false);
	});

	it('papel sem permissão de rota bloqueia mesmo com feature presente no grupo', () => {
		const user = buildUser({
			role: 'ATTENDANT',
			groups: [buildGroup({ name: 'Acessos', featureKeys: ['users'] })],
		});

		assert.equal(hasFeatureAccess(user, 'users'), false);
	});

	it('usuário sem nenhum grupo é regido apenas pelo papel', () => {
		const user = buildUser({ role: 'MANAGER' });

		assert.equal(hasFeatureAccess(user, 'leads'), true);
		assert.equal(hasFeatureAccess(user, 'users'), false);
	});

	it('sessão legada com apenas um grupo continua funcionando', () => {
		const legacyGroup = buildGroup({
			name: 'Operação',
			featureKeys: ['leads'],
		});
		const user = {
			role: 'ATTENDANT' as UserRole,
			accessGroup: legacyGroup,
		};

		assert.equal(hasFeatureAccess(user, 'leads'), true);
		assert.equal(hasFeatureAccess(user, 'deals'), true);
		assert.equal(hasFeatureAccess(user, 'customers'), true);
	});

	it('sessão legada sem feature no grupo único permanece bloqueada', () => {
		const legacyGroup = buildGroup({
			name: 'Dashboards',
			featureKeys: ['dashboardOperational'],
		});
		const user = {
			role: 'MANAGER' as UserRole,
			accessGroup: legacyGroup,
		};

		assert.equal(hasFeatureAccess(user, 'leads'), false);
		assert.equal(hasFeatureAccess(user, 'dashboardOperational'), true);
	});
});
