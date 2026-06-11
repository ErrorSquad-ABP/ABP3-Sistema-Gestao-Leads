import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
import {
	User,
	type UserAccessGroupSummary,
} from '../../domain/entities/user.entity.js';
import { UserPresenter } from './user.presenter.js';

function buildSampleHash() {
	return [
		'$argon2id',
		'v=19',
		'm=65536,t=3,p=1',
		'c29tZXNhbHQ',
		'9q4FC2S7w6zV8nQ8PjM4Ww',
	].join('$');
}

const GESTAO_ID = '11111111-1111-4111-8111-aaaaaaaaaaaa';
const RELATORIOS_ID = '22222222-2222-4222-8222-bbbbbbbbbbbb';

function groupSummary(overrides: {
	id: string;
	name: string;
	featureKeys: readonly string[];
}): UserAccessGroupSummary {
	return {
		id: Uuid.parse(overrides.id),
		name: overrides.name,
		description: `Grupo ${overrides.name}`,
		baseRole: null,
		featureKeys: overrides.featureKeys,
		isSystemGroup: false,
	};
}

function buildUser(groups: readonly UserAccessGroupSummary[]): User {
	return new User(
		Uuid.parse('44444444-4444-4444-8444-444444444444'),
		Name.create('Maria Silva'),
		Email.create('maria@example.com'),
		PasswordHash.create(buildSampleHash()),
		'MANAGER',
		[],
		[],
		groups.map((group) => group.id),
		groups,
	);
}

describe('Apresentação de usuário com múltiplos grupos', () => {
	it('resposta da API expõe todos os grupos vinculados e a união de features', () => {
		// Arrange
		const relatorios = groupSummary({
			id: RELATORIOS_ID,
			name: 'Relatórios',
			featureKeys: ['reports', 'exports'],
		});
		const gestao = groupSummary({
			id: GESTAO_ID,
			name: 'Gestão',
			featureKeys: ['leads', 'reports'],
		});
		const user = buildUser([relatorios, gestao]);

		// Act
		const response = UserPresenter.toResponse(user);

		// Assert
		assert.deepEqual(response.accessGroupIds.sort(), [
			GESTAO_ID,
			RELATORIOS_ID,
		]);
		assert.equal(response.accessGroups.length, 2);
		assert.deepEqual(response.featureKeys, ['exports', 'leads', 'reports']);
	});

	it('campos legados apontam para o primeiro grupo ordenado por nome', () => {
		// Arrange
		const relatorios = groupSummary({
			id: RELATORIOS_ID,
			name: 'Relatórios',
			featureKeys: ['reports'],
		});
		const gestao = groupSummary({
			id: GESTAO_ID,
			name: 'Gestão',
			featureKeys: ['leads'],
		});
		const user = buildUser([relatorios, gestao]);

		// Act
		const response = UserPresenter.toResponse(user);

		// Assert — 'Gestão' < 'Relatórios' na ordenação por nome
		assert.equal(response.accessGroupId, GESTAO_ID);
		assert.equal(response.accessGroup?.name, 'Gestão');
	});

	it('usuário sem grupos mantém contrato legado nulo e features vazias', () => {
		// Arrange
		const user = buildUser([]);

		// Act
		const response = UserPresenter.toResponse(user);

		// Assert
		assert.equal(response.accessGroupId, null);
		assert.equal(response.accessGroup, null);
		assert.deepEqual(response.accessGroupIds, []);
		assert.deepEqual(response.accessGroups, []);
		assert.deepEqual(response.featureKeys, []);
	});
});
