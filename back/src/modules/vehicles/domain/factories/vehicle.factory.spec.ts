import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { VehicleFactory } from './vehicle.factory.js';

describe('VehicleFactory', () => {
	it('defaults status to AVAILABLE', () => {
		const factory = new VehicleFactory();
		const vehicle = factory.create({
			storeId: Uuid.generate().value,
			brand: 'Marca',
			model: 'Modelo',
			modelYear: 2024,
			mileage: 0,
			supportedFuelType: 'FLEX',
			price: '45000.00',
		});
		assert.equal(vehicle.status, 'AVAILABLE');
	});
});
