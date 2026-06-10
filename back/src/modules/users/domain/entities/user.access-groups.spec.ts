import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
import { User, type UserAccessGroupSummary } from './user.entity.js';

function buildSampleHash() {
	return [
		'$argon2id',
		'v=19',
		'm=65536,t=3,p=1',
		'c29tZXNhbHQ',
		'9q4FC2S7w6zV8nQ8PjM4Ww',
	].join('$');
}

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

const GESTAO_ID = '11111111-1111-4111-8111-aaaaaaaaaaaa';
const RELATORIOS_ID = '22222222-2222-4222-8222-bbbbbbbbbbbb';
const EXECUTIVO_ID = '33333333-3333-4333-8333-cccccccccccc';

function buildUserWithGroups(groups: readonly UserAccessGroupSummary[]): User {
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

describe('Usuário com múltiplos grupos de acesso', () => {
	it('usuário vinculado a vários grupos acumula a união das features sem duplicar', () => {
		// Arrange
		const gestao = groupSummary({
			id: GESTAO_ID,
			name: 'Grupo de gestão',
			featureKeys: ['leads', 'dashboardOperational', 'profile'],
		});
		const relatorios = groupSummary({
			id: RELATORIOS_ID,
			name: 'Grupo de relatórios',
			featureKeys: ['reports', 'exports', 'profile'],
		});

		// Act
		const user = buildUserWithGroups([gestao, relatorios]);

		// Assert
		assert.deepEqual(
			[...user.featureKeys].sort(),
			['dashboardOperational', 'exports', 'leads', 'profile', 'reports'],
		);
	});

	it('usuário sem grupos não recebe nenhuma feature', () => {
		// Arrange + Act
		const user = buildUserWithGroups([]);

		// Assert
		assert.deepEqual([...user.featureKeys], []);
	});

	it('feature de grupo não vinculado nunca aparece no conjunto efetivo (sem herança)', () => {
		// Arrange — executivo declara 'exports', mas o usuário só pertence à gestão
		const gestao = groupSummary({
			id: GESTAO_ID,
			name: 'Grupo de gestão',
			featureKeys: ['leads'],
		});

		// Act
		const user = buildUserWithGroups([gestao]);

		// Assert
		assert.equal(user.featureKeys.includes('exports'), false);
		assert.deepEqual([...user.featureKeys], ['leads']);
	});

	it('trocar os grupos do usuário substitui o conjunto inteiro de vínculos', () => {
		// Arrange
		const gestao = groupSummary({
			id: GESTAO_ID,
			name: 'Grupo de gestão',
			featureKeys: ['leads'],
		});
		const executivo = groupSummary({
			id: EXECUTIVO_ID,
			name: 'Grupo executivo',
			featureKeys: ['reports'],
		});
		const user = buildUserWithGroups([gestao]);

		// Act
		user.changeAccessGroups([executivo.id], [executivo]);

		// Assert
		assert.deepEqual(
			user.accessGroupIds.map((id) => id.value),
			[EXECUTIVO_ID],
		);
		assert.deepEqual([...user.featureKeys], ['reports']);
	});

	it('estado persistível é o mesmo independentemente da ordem dos grupos', () => {
		// Arrange
		const gestao = groupSummary({
			id: GESTAO_ID,
			name: 'Grupo de gestão',
			featureKeys: ['leads'],
		});
		const relatorios = groupSummary({
			id: RELATORIOS_ID,
			name: 'Grupo de relatórios',
			featureKeys: ['reports'],
		});

		// Act
		const a = buildUserWithGroups([gestao, relatorios]);
		const b = buildUserWithGroups([relatorios, gestao]);

		// Assert
		assert.equal(User.sameState(a, b), true);
	});

	it('estado persistível difere quando o conjunto de grupos difere', () => {
		// Arrange
		const gestao = groupSummary({
			id: GESTAO_ID,
			name: 'Grupo de gestão',
			featureKeys: ['leads'],
		});
		const relatorios = groupSummary({
			id: RELATORIOS_ID,
			name: 'Grupo de relatórios',
			featureKeys: ['reports'],
		});

		// Act
		const a = buildUserWithGroups([gestao, relatorios]);
		const b = buildUserWithGroups([gestao]);

		// Assert
		assert.equal(User.sameState(a, b), false);
	});
});
