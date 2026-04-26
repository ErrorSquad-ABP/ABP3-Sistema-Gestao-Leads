import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { AuthenticatedUser } from '../../login/types/login.types';
import { diffDaysInclusive, validateDraftFilter } from './analytic-dashboard-filters';

const baseUser = {
	id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
	name: 'Dashboard User',
	email: 'dashboard@example.com',
	teamId: null,
	memberTeamIds: [],
	managedTeamIds: [],
	accessGroupId: null,
	accessGroup: null,
} satisfies Omit<AuthenticatedUser, 'role'>;

describe('diffDaysInclusive', () => {
	it('counts both start and end dates', () => {
		assert.equal(diffDaysInclusive('2026-04-01', '2026-04-30'), 30);
	});
});

describe('validateDraftFilter', () => {
	it('allows non custom filters without checking dates', () => {
		assert.equal(
			validateDraftFilter(
				{ ...baseUser, role: 'MANAGER' },
				'month',
				'',
				'',
			),
			null,
		);
	});

	it('requires both custom bounds', () => {
		assert.equal(
			validateDraftFilter(
				{ ...baseUser, role: 'MANAGER' },
				'custom',
				'2026-04-01',
				'',
			),
			'Selecione a data inicial e a data final para aplicar um periodo customizado.',
		);
	});

	it('rejects inverted custom range', () => {
		assert.equal(
			validateDraftFilter(
				{ ...baseUser, role: 'MANAGER' },
				'custom',
				'2026-05-10',
				'2026-05-01',
			),
			'A data final precisa ser igual ou posterior a data inicial.',
		);
	});

	it('rejects range above one year for non admin', () => {
		assert.equal(
			validateDraftFilter(
				{ ...baseUser, role: 'GENERAL_MANAGER' },
				'custom',
				'2025-01-01',
				'2026-02-01',
			),
			'Para este perfil, o periodo customizado pode ter no maximo um ano.',
		);
	});

	it('allows long custom range for admin', () => {
		assert.equal(
			validateDraftFilter(
				{ ...baseUser, role: 'ADMINISTRATOR' },
				'custom',
				'2024-01-01',
				'2026-04-25',
			),
			null,
		);
	});
});
