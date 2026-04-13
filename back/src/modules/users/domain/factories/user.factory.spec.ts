import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
import { User } from '../entities/user.entity.js';
import { UserFactory } from './user.factory.js';

const SAMPLE_HASH =
	'$argon2id$v=19$m=65536,t=3,p=1$c29tZXNhbHQ$9q4FC2S7w6zV8nQ8PjM4Ww';

function buildUser(overrides?: { name?: string }): User {
	const id = Uuid.parse('11111111-1111-4111-8111-111111111111');
	const name = Name.create(overrides?.name ?? 'Maria Silva');
	const email = Email.create('maria@example.com');
	const hash = PasswordHash.create(SAMPLE_HASH);
	return new User(id, name, email, hash, 'ATTENDANT', [], []);
}

describe('UserFactory', () => {
	it('create preenche estado inicial sem equipes', () => {
		const factory = new UserFactory();
		const created = factory.create({
			name: 'João',
			email: 'joao@example.com',
			passwordHash: SAMPLE_HASH,
			role: 'ATTENDANT',
		});

		assert.equal(created.name.value, 'João');
		assert.equal(created.email.value, 'joao@example.com');
		assert.equal(created.role, 'ATTENDANT');
		assert.equal(created.memberTeamIds.length, 0);
		assert.equal(created.managedTeamIds.length, 0);
	});
});

describe('User entity mutations', () => {
	it('changeName altera apenas o nome', () => {
		const user = buildUser();
		user.changeName(Name.create('Outro Nome'));
		assert.equal(user.name.value, 'Outro Nome');
		assert.ok(user.email.equals(Email.create('maria@example.com')));
	});

	it('User.sameState compara campos persistíveis', () => {
		const a = buildUser();
		const b = buildUser();
		assert.equal(User.sameState(a, b), true);
	});
});

describe('User.sameState', () => {
	it('retorna false quando qualquer campo persistível difere', () => {
		const a = buildUser();
		const b = buildUser({ name: 'Outro' });
		assert.equal(User.sameState(a, b), false);
	});
});
