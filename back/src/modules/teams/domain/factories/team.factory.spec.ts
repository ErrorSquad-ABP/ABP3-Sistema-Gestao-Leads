import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { Team } from '../entities/team.entity.js';
import { TeamFactory } from './team.factory.js';

function buildTeam(overrides?: {
	name?: string;
	managerId?: string | null;
	storeId?: string | null;
}): Team {
	return new Team(
		Uuid.parse('11111111-1111-4111-8111-111111111111'),
		Name.create(overrides?.name ?? 'Equipe Comercial'),
		overrides?.managerId === undefined
			? Uuid.parse('22222222-2222-4222-8222-222222222222')
			: overrides.managerId === null
				? null
				: Uuid.parse(overrides.managerId),
		overrides?.storeId === undefined
			? Uuid.parse('33333333-3333-4333-8333-333333333333')
			: overrides.storeId === null
				? null
				: Uuid.parse(overrides.storeId),
	);
}

describe('TeamFactory', () => {
	it('aplica apenas os campos informados no update', () => {
		const factory = new TeamFactory();
		const existing = buildTeam();
		const next = factory.update(existing, { name: 'Equipe Premium' });

		assert.equal(next.name.value, 'Equipe Premium');
		assert.equal(next.managerId?.value, existing.managerId?.value);
		assert.equal(next.storeId?.value, existing.storeId?.value);
		assert.equal(next.id.value, existing.id.value);
	});

	it('permite limpar o manager explicitamente com null', () => {
		const factory = new TeamFactory();
		const existing = buildTeam();
		const next = factory.update(existing, { managerId: null });

		assert.equal(next.managerId, null);
		assert.equal(next.name.value, existing.name.value);
	});

	it('permite limpar o storeId explicitamente com null', () => {
		const factory = new TeamFactory();
		const existing = buildTeam();
		const next = factory.update(existing, { storeId: null });

		assert.equal(next.storeId, null);
		assert.equal(next.managerId?.value, existing.managerId?.value);
	});
});
