import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { DealInvalidStageTransitionError } from '../errors/deal-invalid-stage-transition.error.js';
import { DealFactory } from './deal.factory.js';

describe('DealFactory', () => {
	it('rejects starting a deal at a stage other than the first in the pipeline', () => {
		const factory = new DealFactory();
		assert.throws(
			() =>
				factory.create({
					leadId: Uuid.generate().value,
					title: 'Teste',
					value: null,
					stage: 'NEGOTIATION',
				}),
			DealInvalidStageTransitionError,
		);
	});

	it('creates at INITIAL_CONTACT when stage is omitted', () => {
		const factory = new DealFactory();
		const deal = factory.create({
			leadId: Uuid.generate().value,
			title: 'Teste',
			value: null,
		});
		assert.equal(deal.stage, 'INITIAL_CONTACT');
	});
});
