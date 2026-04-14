import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LeadAccessDeniedError } from '../../domain/errors/lead-access-denied.error.js';
import { LeadAccessPolicy } from './lead-access-policy.service.js';

describe('LeadAccessPolicy.assertCanListAllLeads', () => {
	const policy = new LeadAccessPolicy(
		{ create: () => ({}) } as never,
		{ create: () => ({}) } as never,
	);

	it('permite ADMINISTRATOR', async () => {
		await policy.assertCanListAllLeads({
			userId: '00000000-0000-4000-8000-000000000001',
			role: 'ADMINISTRATOR',
		});
	});

	it('permite GENERAL_MANAGER', async () => {
		await policy.assertCanListAllLeads({
			userId: '00000000-0000-4000-8000-000000000002',
			role: 'GENERAL_MANAGER',
		});
	});

	it('rejeita MANAGER', async () => {
		await assert.rejects(
			() =>
				policy.assertCanListAllLeads({
					userId: '00000000-0000-4000-8000-000000000003',
					role: 'MANAGER',
				}),
			LeadAccessDeniedError,
		);
	});

	it('rejeita ATTENDANT', async () => {
		await assert.rejects(
			() =>
				policy.assertCanListAllLeads({
					userId: '00000000-0000-4000-8000-000000000004',
					role: 'ATTENDANT',
				}),
			LeadAccessDeniedError,
		);
	});
});
