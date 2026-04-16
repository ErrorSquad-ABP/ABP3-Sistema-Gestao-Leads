import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Money } from '../../../../shared/domain/value-objects/money.value-object.js';
import { VehicleInactiveError } from '../errors/vehicle-inactive.error.js';
import { Vehicle } from './vehicle.entity.js';

describe('Vehicle entity', () => {
	it('deactivates and blocks changes', () => {
		const now = new Date('2026-01-01T12:00:00.000Z');
		const vehicle = new Vehicle(
			Uuid.generate(),
			Uuid.generate(),
			'Marca',
			'Modelo',
			null,
			2024,
			null,
			null,
			0,
			'FLEX',
			Money.fromDecimalString('1.00'),
			'AVAILABLE',
			null,
			null,
			now,
			now,
		);

		vehicle.deactivate();
		assert.equal(vehicle.status, 'INACTIVE');

		assert.throws(() => vehicle.changeBrand('Outra'), VehicleInactiveError);
	});
});
