import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validate } from 'class-validator';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { Store } from '../../domain/entities/store.entity.js';
import { CreateStoreValidator } from '../validators/create-store.validator.js';
import { UpdateStoreValidator } from '../validators/update-store.validator.js';
import type { JwtUser } from '../../../auth/presentation/decorators/current-user.decorator.js';
import { StoreController } from './store.controller.js';

const storeId = '11111111-1111-4111-8111-111111111111';
const actorUserId = '22222222-2222-4222-8222-222222222222';
const actor: JwtUser = {
	userId: actorUserId,
	role: 'ADMINISTRATOR',
	jti: '33333333-3333-4333-8333-333333333333',
};

function buildStore(body: {
	readonly addressLine?: string | null;
	readonly city?: string | null;
	readonly coverage?: string | null;
	readonly distributionRegion?: string | null;
	readonly name: string;
	readonly region?: string | null;
	readonly scope?: string | null;
	readonly state?: string | null;
}) {
	return new Store(Uuid.parse(storeId), Name.create(body.name), body);
}

function assignValidator<T extends object>(target: T, data: Partial<T>): T {
	return Object.assign(target, data);
}

describe('StoreController create/update', () => {
	it('creates a store with the complete form payload and returns persisted fields', async () => {
		const createBody = {
			addressLine: 'Rua Centro, 100',
			city: 'Caçapava',
			coverage: 'Vale do Paraíba',
			distributionRegion: 'Sudeste',
			name: 'Loja Caçapava',
			region: 'Caçapava - SP',
			scope: 'Abrangência regional.',
			state: 'SP',
		};
		let persistedBody: typeof createBody | undefined;
		const controller = new StoreController(
			{
				async execute(userId: string, body: typeof createBody) {
					assert.equal(userId, actorUserId);
					persistedBody = body;
					return buildStore(body);
				},
			} as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
		);

		const response = await controller.create(
			actor,
			assignValidator(new CreateStoreValidator(), createBody),
		);

		assert.deepEqual({ ...persistedBody }, createBody);
		assert.equal(response.name, createBody.name);
		assert.equal(response.addressLine, createBody.addressLine);
		assert.equal(response.city, createBody.city);
		assert.equal(response.state, createBody.state);
		assert.equal(response.scope, createBody.scope);
	});

	it('updates a store with nullable fields and returns the persisted response', async () => {
		const updateBody = {
			addressLine: null,
			city: 'São Paulo',
			coverage: 'SP',
			distributionRegion: 'Sudeste',
			name: 'Loja Matriz',
			region: 'Matriz - SP',
			scope: null,
			state: 'SP',
		};
		let persistedBody: typeof updateBody | undefined;
		const controller = new StoreController(
			{} as never,
			{
				async execute(userId: string, id: string, body: typeof updateBody) {
					assert.equal(userId, actorUserId);
					assert.equal(id, storeId);
					persistedBody = body;
					return buildStore(body);
				},
			} as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
		);

		const response = await controller.update(
			actor,
			storeId,
			assignValidator(new UpdateStoreValidator(), updateBody),
		);

		assert.deepEqual({ ...persistedBody }, updateBody);
		assert.equal(response.addressLine, null);
		assert.equal(response.scope, null);
		assert.equal(response.city, updateBody.city);
	});

	it('rejects invalid state values before the endpoint persists data', async () => {
		const validator = assignValidator(new CreateStoreValidator(), {
			name: 'Loja Inválida',
			state: 'Sao Paulo',
		});

		const errors = await validate(validator);

		assert.ok(errors.some((error) => error.property === 'state'));
	});
});
