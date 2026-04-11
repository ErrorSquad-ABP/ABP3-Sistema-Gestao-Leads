import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { StoreHasLinkedLeadsError } from '../../../modules/stores/domain/errors/store-has-linked-leads.error.js';
import { StoreNotFoundError } from '../../../modules/stores/domain/errors/store-not-found.error.js';
import { TeamInvalidManagerError } from '../../../modules/teams/domain/errors/team-invalid-manager.error.js';
import { TeamInvalidStoreError } from '../../../modules/teams/domain/errors/team-invalid-store.error.js';
import { TeamNotFoundError } from '../../../modules/teams/domain/errors/team-not-found.error.js';
import { DomainErrorFilter } from './domain-error.filter.js';

describe('DomainErrorFilter', () => {
	it('maps team and store not found errors to 404', () => {
		const filter = new DomainErrorFilter();
		const teamMapped = filter['mapDomainException'](
			new TeamNotFoundError('11111111-1111-4111-8111-111111111111'),
		);
		const storeMapped = filter['mapDomainException'](
			new StoreNotFoundError('22222222-2222-4222-8222-222222222222'),
		);

		assert.equal(teamMapped?.status, 404);
		assert.equal(teamMapped?.body.errors[0]?.code, 'team.not_found');
		assert.equal(storeMapped?.status, 404);
		assert.equal(storeMapped?.body.errors[0]?.code, 'store.not_found');
	});

	it('maps business validation and conflict errors from teams and stores', () => {
		const filter = new DomainErrorFilter();
		const invalidManagerMapped = filter['mapDomainException'](
			new TeamInvalidManagerError('33333333-3333-4333-8333-333333333333'),
		);
		const invalidStoreMapped = filter['mapDomainException'](
			new TeamInvalidStoreError('44444444-4444-4444-8444-444444444444'),
		);
		const linkedLeadsMapped = filter['mapDomainException'](
			new StoreHasLinkedLeadsError('55555555-5555-4555-8555-555555555555'),
		);

		assert.equal(invalidManagerMapped?.status, 400);
		assert.equal(
			invalidManagerMapped?.body.errors[0]?.code,
			'team.invalid_manager',
		);
		assert.equal(invalidStoreMapped?.status, 400);
		assert.equal(
			invalidStoreMapped?.body.errors[0]?.code,
			'team.invalid_store',
		);
		assert.equal(linkedLeadsMapped?.status, 409);
		assert.equal(
			linkedLeadsMapped?.body.errors[0]?.code,
			'store.has_linked_leads',
		);
	});
});
