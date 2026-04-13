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
	it('create instancia loja com nome valido', () => {
		const factory = new StoreFactory();
		const store = factory.create({ name: 'Loja Norte' });

		assert.equal(store.name.value, 'Loja Norte');
		assert.ok(Uuid.parse(store.id.value));
	});
});

describe('Store entity', () => {
	it('rename altera o nome quando diferente', () => {
		const store = buildStore();
		store.rename(Name.create('Loja Norte'));
		assert.equal(store.name.value, 'Loja Norte');
	});

	it('rename ignora nome equivalente', () => {
		const store = buildStore('Loja Centro');
		const before = store.name.value;
		store.rename(Name.create('Loja Centro'));
		assert.equal(store.name.value, before);
	});
});
