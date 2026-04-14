import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { canManageTeam, isTeamManagerRole } from './team-manager.policy.js';

describe('team-manager.policy', () => {
	it('canManageTeam / isTeamManagerRole aceitam apenas papéis de gestão', () => {
		assert.equal(canManageTeam('MANAGER'), true);
		assert.equal(canManageTeam('GENERAL_MANAGER'), true);
		assert.equal(canManageTeam('ADMINISTRATOR'), true);
		assert.equal(isTeamManagerRole('MANAGER'), true);

		assert.equal(canManageTeam('ATTENDANT'), false);
		assert.equal(isTeamManagerRole('ATTENDANT'), false);
	});
});
