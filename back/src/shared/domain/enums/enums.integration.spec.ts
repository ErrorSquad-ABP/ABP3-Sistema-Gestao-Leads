import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DomainValidationError } from '../errors/domain-validation.error.js';
import {
	AUDIT_ACTION_TYPES,
	assertAuditActionType,
	assertDealImportance,
	assertDealStage,
	assertDealStatus,
	assertLeadStatus,
	assertUserRole,
	DEAL_IMPORTANCES,
	DEAL_STAGES,
	DEAL_STATUSES,
	isAuditActionType,
	isDealImportance,
	isDealStage,
	isDealStatus,
	isLeadStatus,
	isUserRole,
	LEAD_STATUSES,
	parseAuditActionType,
	parseDealImportance,
	parseDealStage,
	parseDealStatus,
	parseLeadStatus,
	parseUserRole,
	USER_ROLES,
} from './index.js';

describe('shared domain enums integration', () => {
	it('keeps enum catalogs aligned with domain modeling', () => {
		assert.deepEqual(USER_ROLES, [
			'ATTENDANT',
			'MANAGER',
			'GENERAL_MANAGER',
			'ADMINISTRATOR',
		]);
		assert.deepEqual(LEAD_STATUSES, [
			'NEW',
			'CONTACTED',
			'QUALIFIED',
			'DISQUALIFIED',
			'CONVERTED',
		]);
		assert.deepEqual(DEAL_STATUSES, ['OPEN', 'WON', 'LOST']);
		assert.deepEqual(DEAL_STAGES, [
			'INITIAL_CONTACT',
			'NEGOTIATION',
			'PROPOSAL',
			'CLOSING',
		]);
		assert.deepEqual(DEAL_IMPORTANCES, ['COLD', 'WARM', 'HOT']);
		assert.deepEqual(AUDIT_ACTION_TYPES, [
			'LOGIN',
			'CREATE',
			'UPDATE',
			'DELETE',
			'STATUS_CHANGE',
			'STAGE_CHANGE',
		]);
	});

	it('accepts canonical values via parse/assert helpers', () => {
		assert.equal(parseUserRole('MANAGER'), 'MANAGER');
		assert.equal(parseLeadStatus('QUALIFIED'), 'QUALIFIED');
		assert.equal(parseDealStatus('OPEN'), 'OPEN');
		assert.equal(parseDealStage('NEGOTIATION'), 'NEGOTIATION');
		assert.equal(parseDealImportance('HOT'), 'HOT');
		assert.equal(parseAuditActionType('STATUS_CHANGE'), 'STATUS_CHANGE');

		assert.equal(assertUserRole('ATTENDANT'), 'ATTENDANT');
		assert.equal(assertLeadStatus('NEW'), 'NEW');
		assert.equal(assertDealStatus('LOST'), 'LOST');
		assert.equal(assertDealStage('CLOSING'), 'CLOSING');
		assert.equal(assertDealImportance('WARM'), 'WARM');
		assert.equal(assertAuditActionType('LOGIN'), 'LOGIN');
	});

	it('rejects invalid or non-canonical values deterministically', () => {
		assert.throws(() => parseUserRole('manager'), DomainValidationError);
		assert.throws(() => parseLeadStatus(' qualified '), DomainValidationError);
		assert.throws(() => parseDealStatus('closed'), DomainValidationError);
		assert.throws(() => parseDealStage('proposal'), DomainValidationError);
		assert.throws(() => parseDealImportance(' warm '), DomainValidationError);
		assert.throws(
			() => parseAuditActionType('status_change'),
			DomainValidationError,
		);
	});

	it('exposes reliable predicates for entity-level guards', () => {
		assert.equal(isUserRole('ADMINISTRATOR'), true);
		assert.equal(isLeadStatus('CONVERTED'), true);
		assert.equal(isDealStatus('WON'), true);
		assert.equal(isDealStage('INITIAL_CONTACT'), true);
		assert.equal(isDealImportance('COLD'), true);
		assert.equal(isAuditActionType('DELETE'), true);

		assert.equal(isUserRole(undefined), false);
		assert.equal(isLeadStatus(''), false);
		assert.equal(isDealStatus('INVALID'), false);
		assert.equal(isDealStage(null), false);
		assert.equal(isDealImportance(123), false);
		assert.equal(isAuditActionType('UPDATE '), false);
	});
});
