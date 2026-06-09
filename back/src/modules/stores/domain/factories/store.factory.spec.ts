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
		const store = factory.create({
			addressLine: 'Rua Norte, 10',
			city: 'São Paulo',
			name: 'Loja Norte',
			state: 'SP',
		});

		assert.equal(store.name.value, 'Loja Norte');
		assert.equal(store.addressLine, 'Rua Norte, 10');
		assert.equal(store.city, 'São Paulo');
		assert.equal(store.state, 'SP');
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

	it('updateDetails altera campos completos da loja', () => {
		const store = buildStore();
		store.updateDetails({
			addressLine: 'Av. Central, 200',
			city: 'Caçapava',
			coverage: 'Vale do Paraíba',
			distributionRegion: 'Sudeste',
			region: 'Caçapava - SP',
			scope: 'Abrangência regional.',
			state: 'SP',
		});

		assert.equal(store.addressLine, 'Av. Central, 200');
		assert.equal(store.city, 'Caçapava');
		assert.equal(store.coverage, 'Vale do Paraíba');
		assert.equal(store.distributionRegion, 'Sudeste');
		assert.equal(store.region, 'Caçapava - SP');
		assert.equal(store.scope, 'Abrangência regional.');
		assert.equal(store.state, 'SP');
	});
});
