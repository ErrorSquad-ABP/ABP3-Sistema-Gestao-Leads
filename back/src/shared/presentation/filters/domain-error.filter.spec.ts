import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ArgumentsHost } from '@nestjs/common';

import { StoreDeleteBlockedError } from '../../../modules/stores/domain/errors/store-delete-blocked.error.js';
import { StoreNotFoundError } from '../../../modules/stores/domain/errors/store-not-found.error.js';
import { TeamInvalidManagerError } from '../../../modules/teams/domain/errors/team-invalid-manager.error.js';
import { TeamInvalidStoreError } from '../../../modules/teams/domain/errors/team-invalid-store.error.js';
import { TeamAccessDeniedError } from '../../../modules/teams/domain/errors/team-access-denied.error.js';
import { TeamNotFoundError } from '../../../modules/teams/domain/errors/team-not-found.error.js';
import { DomainErrorFilter } from './domain-error.filter.js';

function mapDomainException(filter: DomainErrorFilter, exception: unknown) {
	const mapper = Reflect.get(filter, 'mapDomainException') as (
		error: unknown,
	) =>
		| {
				status: number;
				body: { errors?: Array<{ code?: string }> };
		  }
		| undefined;

	return mapper.call(filter, exception);
}

function createHttpHost(): {
	readonly host: ArgumentsHost;
	readonly getStatus: () => number;
	readonly getBody: () => unknown;
} {
	let status = 0;
	let body: unknown;
	const response = {
		status(code: number) {
			status = code;
			return this;
		},
		json(payload: unknown) {
			body = payload;
		},
	};
	const mockRequest = {
		path: '/api/test',
		method: 'GET',
		ip: '127.0.0.1',
		socket: {},
		url: '/api/test',
	};
	const host = {
		switchToHttp: () => ({
			getResponse: () => response,
			getRequest: () => mockRequest,
		}),
	};
	return {
		host: host as ArgumentsHost,
		getStatus: () => status,
		getBody: () => body,
	};
}

describe('DomainErrorFilter', () => {
	it('maps team access denied to 403', () => {
		const filter = new DomainErrorFilter();
		const mapped = mapDomainException(
			filter,
			new TeamAccessDeniedError('Fora do escopo.'),
		);
		assert.equal(mapped?.status, 403);
		assert.equal(mapped?.body.errors?.[0]?.code, 'team.access.denied');
	});

	it('maps team and store not found errors to 404', () => {
		const filter = new DomainErrorFilter();
		const teamMapped = mapDomainException(
			filter,
			new TeamNotFoundError('11111111-1111-4111-8111-111111111111'),
		);
		const storeMapped = mapDomainException(
			filter,
			new StoreNotFoundError('22222222-2222-4222-8222-222222222222'),
		);

		assert.equal(teamMapped?.status, 404);
		assert.equal(teamMapped?.body.errors?.[0]?.code, 'team.not_found');
		assert.equal(storeMapped?.status, 404);
		assert.equal(storeMapped?.body.errors?.[0]?.code, 'store.not_found');
	});

	it('maps business validation and conflict errors from teams and stores', () => {
		const filter = new DomainErrorFilter();
		const invalidManagerMapped = mapDomainException(
			filter,
			new TeamInvalidManagerError('33333333-3333-4333-8333-333333333333'),
		);
		const invalidStoreMapped = mapDomainException(
			filter,
			new TeamInvalidStoreError('44444444-4444-4444-8444-444444444444'),
		);
		const deleteBlockedMapped = mapDomainException(
			filter,
			StoreDeleteBlockedError.withCounts(
				'55555555-5555-4555-8555-555555555555',
				{
					leads: 2,
					teams: 0,
				},
			),
		);

		assert.equal(invalidManagerMapped?.status, 400);
		assert.equal(
			invalidManagerMapped?.body.errors?.[0]?.code,
			'team.invalid_manager',
		);
		assert.equal(invalidStoreMapped?.status, 400);
		assert.equal(
			invalidStoreMapped?.body.errors?.[0]?.code,
			'team.invalid_store',
		);
		assert.equal(deleteBlockedMapped?.status, 409);
		assert.equal(
			deleteBlockedMapped?.body.errors?.[0]?.code,
			'store.delete_blocked',
		);
	});

	it('catch() aplica status HTTP correto para erros de stores e teams (ciclo completo)', () => {
		const filter = new DomainErrorFilter();

		{
			const { host, getStatus, getBody } = createHttpHost();
			filter.catch(
				new StoreNotFoundError('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
				host,
			);
			assert.equal(getStatus(), 404);
			const b = getBody() as {
				success: boolean;
				errors?: Array<{ code: string }>;
			};
			assert.equal(b.success, false);
			assert.equal(b.errors?.[0]?.code, 'store.not_found');
		}

		{
			const { host, getStatus, getBody } = createHttpHost();
			filter.catch(
				new TeamNotFoundError('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
				host,
			);
			assert.equal(getStatus(), 404);
			const b = getBody() as {
				success: boolean;
				errors?: Array<{ code: string }>;
			};
			assert.equal(b.errors?.[0]?.code, 'team.not_found');
		}

		{
			const { host, getStatus, getBody } = createHttpHost();
			filter.catch(
				new TeamInvalidManagerError('cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
				host,
			);
			assert.equal(getStatus(), 400);
			const b = getBody() as {
				success: boolean;
				errors?: Array<{ code: string }>;
			};
			assert.equal(b.errors?.[0]?.code, 'team.invalid_manager');
		}
	});
});
