import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { DealAlreadyClosedError } from '../errors/deal-already-closed.error.js';
import { DealInvalidStageTransitionError } from '../errors/deal-invalid-stage-transition.error.js';
import { Deal } from './deal.entity.js';

describe('Deal entity', () => {
	it('closes as WON and sets closedAt', () => {
		const now = new Date('2026-01-01T12:00:00.000Z');
		const deal = new Deal(
			Uuid.generate(),
			Uuid.generate(),
			Uuid.generate(),
			'Título',
			null,
			'WARM',
			'INITIAL_CONTACT',
			'OPEN',
			null,
			now,
			now,
		);
		deal.changeStatus('WON');
		assert.equal(deal.status, 'WON');
		assert.ok(deal.closedAt instanceof Date);
	});

	it('rejects stage change when not open', () => {
		const now = new Date('2026-01-01T12:00:00.000Z');
		const deal = new Deal(
			Uuid.generate(),
			Uuid.generate(),
			Uuid.generate(),
			'Título',
			null,
			'WARM',
			'INITIAL_CONTACT',
			'LOST',
			now,
			now,
			now,
		);
		assert.throws(
			() => deal.changeStage('NEGOTIATION'),
			DealAlreadyClosedError,
		);
	});

	it('allows advancing one stage at a time', () => {
		const now = new Date('2026-01-01T12:00:00.000Z');
		const deal = new Deal(
			Uuid.generate(),
			Uuid.generate(),
			Uuid.generate(),
			'Título',
			null,
			'WARM',
			'INITIAL_CONTACT',
			'OPEN',
			null,
			now,
			now,
		);
		deal.changeStage('NEGOTIATION');
		assert.equal(deal.stage, 'NEGOTIATION');
	});

	it('rejects skipping stages forward', () => {
		const now = new Date('2026-01-01T12:00:00.000Z');
		const deal = new Deal(
			Uuid.generate(),
			Uuid.generate(),
			Uuid.generate(),
			'Título',
			null,
			'WARM',
			'INITIAL_CONTACT',
			'OPEN',
			null,
			now,
			now,
		);
		assert.throws(
			() => deal.changeStage('PROPOSAL'),
			DealInvalidStageTransitionError,
		);
	});

	it('allows moving back one stage', () => {
		const now = new Date('2026-01-01T12:00:00.000Z');
		const deal = new Deal(
			Uuid.generate(),
			Uuid.generate(),
			Uuid.generate(),
			'Título',
			null,
			'WARM',
			'NEGOTIATION',
			'OPEN',
			null,
			now,
			now,
		);
		deal.changeStage('INITIAL_CONTACT');
		assert.equal(deal.stage, 'INITIAL_CONTACT');
	});
});
