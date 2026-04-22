import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
import { User } from '../entities/user.entity.js';
import { UserFactory } from './user.factory.js';

function buildSampleHash() {
	return [
		'$argon2id',
		'v=19',
		'm=65536,t=3,p=1',
		'c29tZXNhbHQ',
		'9q4FC2S7w6zV8nQ8PjM4Ww',
	].join('$');
}

function buildEmail(localPart: string) {
	return `${localPart}@example.com`;
}

function buildUser(overrides?: {
	name?: string;
	accessGroupId?: string | null;
}): User {
	const id = Uuid.parse('11111111-1111-4111-8111-111111111111');
	const name = Name.create(overrides?.name ?? 'Maria Silva');
	const email = Email.create(buildEmail('maria'));
	const hash = PasswordHash.create(buildSampleHash());
	const accessGroupId =
		overrides?.accessGroupId === undefined
			? null
			: overrides.accessGroupId === null
				? null
				: Uuid.parse(overrides.accessGroupId);
	return new User(
		id,
		name,
		email,
		hash,
		'ATTENDANT',
		[],
		[],
		accessGroupId,
		null,
	);
}

describe('UserFactory', () => {
	it('create preenche estado inicial sem equipes', () => {
		const factory = new UserFactory();
			const created = factory.create({
				accessGroupId: null,
				name: 'João',
				email: buildEmail('joao'),
				passwordHash: buildSampleHash(),
				role: 'ATTENDANT',
			});

		assert.equal(created.name.value, 'João');
		assert.equal(created.email.value, buildEmail('joao'));
		assert.equal(created.role, 'ATTENDANT');
		assert.equal(created.memberTeamIds.length, 0);
		assert.equal(created.managedTeamIds.length, 0);
		assert.equal(created.accessGroupId, null);
	});

	it('update preserva vínculos de equipe e altera accessGroupId quando informado', () => {
		const factory = new UserFactory();
			const existing = new User(
				Uuid.parse('11111111-1111-4111-8111-111111111111'),
				Name.create('Ana'),
				Email.create(buildEmail('a')),
				PasswordHash.create(buildSampleHash()),
				'MANAGER',
			[Uuid.parse('22222222-2222-4222-8222-222222222222')],
			[Uuid.parse('33333333-3333-4333-8333-333333333333')],
			null,
			null,
		);
		const next = factory.update(existing, {
			accessGroupId: '44444444-4444-4444-8444-444444444444',
			name: 'Novo Nome',
		});

		assert.equal(next.name.value, 'Novo Nome');
		assert.ok(next.email.equals(existing.email));
		assert.ok(next.passwordHash.equals(existing.passwordHash));
		assert.equal(next.role, existing.role);
		assert.equal(next.memberTeamIds.length, 1);
		assert.equal(next.managedTeamIds.length, 1);
		assert.equal(
			next.accessGroupId?.value,
			'44444444-4444-4444-8444-444444444444',
		);
		assert.ok(next.id.equals(existing.id));
	});
});

describe('User entity mutations', () => {
	it('changeName altera apenas o nome', () => {
		const user = buildUser();
		user.changeName(Name.create('Outro Nome'));
		assert.equal(user.name.value, 'Outro Nome');
		assert.ok(user.email.equals(Email.create(buildEmail('maria'))));
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
