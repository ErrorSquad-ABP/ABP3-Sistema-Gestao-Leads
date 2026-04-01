import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DomainValidationError } from '../errors/domain-validation.error.js';
import {
	ALLOWED_LEAD_SOURCES,
	CloseReason,
	Cpf,
	Email,
	LeadSource,
	Name,
	PasswordHash,
	Phone,
} from './index.js';

describe('shared value objects integration', () => {
	it('creates valid value objects from canonical domain inputs', () => {
		assert.equal(Name.create('Joao Silva').value, 'Joao Silva');
		assert.equal(Email.create('USER@Example.COM').value, 'user@example.com');
		assert.equal(Phone.create('+55 (11) 99888-7766').value, '+5511998887766');
		assert.equal(
			PasswordHash.create(
				'$argon2id$v=19$m=65536,t=3,p=1$c29tZXNhbHQ$9q4FC2S7w6zV8nQ8PjM4Ww',
			).value,
			'$argon2id$v=19$m=65536,t=3,p=1$c29tZXNhbHQ$9q4FC2S7w6zV8nQ8PjM4Ww',
		);
		assert.equal(LeadSource.create('whatsapp').value, 'whatsapp');
		assert.equal(
			CloseReason.create('Cliente optou por outra oferta').value,
			['Cliente', 'optou', 'por', 'outra', 'oferta'].join(' '),
		);
		assert.equal(Cpf.create('529.982.247-25').value, '52998224725');
	});

	it('keeps shared value objects aligned with equality semantics', () => {
		assert.equal(Name.create('Maria').equals(Name.from('Maria')), true);
		assert.equal(Email.create('a@b.com').equals(Email.from('a@b.com')), true);
		assert.equal(
			Phone.create('+5511999999999').equals(Phone.from('+5511999999999')),
			true,
		);
		assert.equal(
			LeadSource.create('digital-form').equals(LeadSource.from('digital-form')),
			true,
		);
		assert.equal(
			CloseReason.create('Sem interesse atual').equals(
				CloseReason.from('Sem interesse atual'),
			),
			true,
		);
		assert.equal(
			Cpf.create('52998224725').equals(Cpf.from('529.982.247-25')),
			true,
		);
	});

	it('rejects structurally invalid inputs with domain errors', () => {
		assert.throws(() => Name.create('--'), DomainValidationError);
		assert.throws(() => Name.create('Ana123'), DomainValidationError);

		assert.throws(
			() => Email.create('.john@example.com'),
			DomainValidationError,
		);
		assert.throws(
			() => Email.create('john..doe@example.com'),
			DomainValidationError,
		);
		assert.throws(
			() => Email.create('john.@example.com'),
			DomainValidationError,
		);

		assert.throws(() => Phone.create('++5511999999999'), DomainValidationError);
		assert.throws(() => Phone.create('+ 5511999999999'), DomainValidationError);
		assert.throws(() => Phone.create('12345'), DomainValidationError);

		assert.throws(
			() =>
				PasswordHash.create(
					'$2a$10$abcdefghijklmnopqrstuv123456789012345678901234567890',
				),
			DomainValidationError,
		);
		assert.throws(
			() => PasswordHash.create('not-a-hash'),
			DomainValidationError,
		);

		assert.throws(() => LeadSource.create('telegram'), DomainValidationError);
		assert.throws(() => CloseReason.create('---'), DomainValidationError);
		assert.throws(
			() => CloseReason.create('bad\nreason'),
			DomainValidationError,
		);

		assert.throws(() => Cpf.create('123'), DomainValidationError);
		assert.throws(() => Cpf.create('11111111111'), DomainValidationError);
	});

	it('exposes lead source catalog ready for entity constraints', () => {
		assert.deepEqual(ALLOWED_LEAD_SOURCES, [
			'store-visit',
			'phone-call',
			'whatsapp',
			'instagram',
			'digital-form',
			'other',
		]);
	});
});
