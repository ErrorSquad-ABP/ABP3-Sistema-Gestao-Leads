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

function buildUser(overrides?: {
	name?: string;
	teamId?: string | null;
}): User {
	const id = Uuid.parse('11111111-1111-4111-8111-111111111111');
	const name = Name.create(overrides?.name ?? 'Maria Silva');
	const email = Email.create('maria@example.com');
	const hash = PasswordHash.create(SAMPLE_HASH);
	const teamId =
		overrides?.teamId === undefined
			? null
			: overrides.teamId === null
				? null
				: Uuid.parse(overrides.teamId);
	return new User(id, name, email, hash, 'ATTENDANT', teamId, null, null);
}

describe('UserFactory', () => {
	it('aplica apenas os campos informados no update', () => {
		const factory = new UserFactory();
		const existing = buildUser();
		const next = factory.update(existing, { name: 'Novo Nome' });

		assert.equal(next.name.value, 'Novo Nome');
		assert.ok(next.email.equals(existing.email));
		assert.ok(next.passwordHash.equals(existing.passwordHash));
		assert.equal(next.role, existing.role);
		assert.equal(next.teamId, existing.teamId);
		assert.ok(next.id.equals(existing.id));
	});

	it('permite definir teamId como null explicitamente', () => {
		const factory = new UserFactory();
		const teamId = Uuid.parse('22222222-2222-4222-8222-222222222222');
		const existing = new User(
			Uuid.parse('11111111-1111-4111-8111-111111111111'),
			Name.create('Ana'),
			Email.create('a@example.com'),
			PasswordHash.create(SAMPLE_HASH),
			'MANAGER',
			teamId,
			null,
			null,
		);
		const cleared = factory.update(existing, { teamId: null });

		assert.equal(cleared.teamId, null);
		assert.equal(cleared.role, 'MANAGER');
	});
});

describe('User.sameState', () => {
	it('retorna true para cópias com o mesmo estado persistível', () => {
		const a = buildUser();
		const b = buildUser();
		assert.equal(User.sameState(a, b), true);
	});

	it('retorna false quando qualquer campo persistível difere', () => {
		const a = buildUser();
		const b = buildUser({ name: 'Outro' });
		assert.equal(User.sameState(a, b), false);
	});
});
