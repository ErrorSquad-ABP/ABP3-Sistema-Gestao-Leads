import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { Team } from '../entities/team.entity.js';
import { TeamFactory } from './team.factory.js';

describe('TeamFactory', () => {
	it('create exige storeId e inicializa membros opcionais', () => {
		const factory = new TeamFactory();
		const a = Uuid.parse('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
		const b = Uuid.parse('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
		const team = factory.create({
			name: 'Equipe A',
			storeId: '33333333-3333-4333-8333-333333333333',
			managerId: null,
			managerRole: null,
			initialMemberUserIds: [a.value, a.value, b.value],
		});

		assert.equal(team.name.value, 'Equipe A');
		assert.equal(team.managerId, null);
		assert.equal(team.memberUserIds.length, 2);
	});

	it('Team.rename e addMember atualizam o agregado', () => {
		const team = new Team(
			Uuid.parse('11111111-1111-4111-8111-111111111111'),
			Name.create('Equipe'),
			Uuid.parse('33333333-3333-4333-8333-333333333333'),
			null,
			[],
			null,
			'new',
		);
		team.rename(Name.create('Equipe Premium'));
		const uid = Uuid.parse('22222222-2222-4222-8222-222222222222');
		team.addMember(uid);
		assert.equal(team.name.value, 'Equipe Premium');
		assert.equal(team.memberUserIds.length, 1);
		assert.equal(team.hasMember(uid), true);
	});
});
