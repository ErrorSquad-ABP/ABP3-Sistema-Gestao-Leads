import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { Store } from '../entities/store.entity.js';
import { StoreFactory } from './store.factory.js';

function buildStore(name = 'Loja Centro'): Store {
	return new Store(
		Uuid.parse('11111111-1111-4111-8111-111111111111'),
		Name.create(name),
	);
}

describe('StoreFactory', () => {
	it('aplica apenas os campos informados no update', () => {
		const factory = new StoreFactory();
		const existing = buildStore();
		const next = factory.update(existing, { name: 'Loja Norte' });

		assert.equal(next.name.value, 'Loja Norte');
		assert.equal(next.id.value, existing.id.value);
	});

	it('preserva o estado quando nenhum campo mutavel e enviado', () => {
		const factory = new StoreFactory();
		const existing = buildStore();
		const next = factory.update(existing, {});

		assert.equal(next.name.value, existing.name.value);
		assert.equal(next.id.value, existing.id.value);
	});
});
