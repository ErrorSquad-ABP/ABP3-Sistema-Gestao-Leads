import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { canManageTeam } from './team-manager-policy.js';

describe('team-manager-policy', () => {
	it('accepts roles compatible with team management', () => {
		assert.equal(canManageTeam('MANAGER'), true);
		assert.equal(canManageTeam('GENERAL_MANAGER'), true);
		assert.equal(canManageTeam('ADMINISTRATOR'), true);
	});

	it('rejects roles incompatible with team management', () => {
		assert.equal(canManageTeam('ATTENDANT'), false);
	});
});
