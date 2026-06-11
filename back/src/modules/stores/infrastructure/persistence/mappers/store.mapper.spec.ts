import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

import { StoreMapper } from './store.mapper.js';

const STORE_FIELD_PATTERNS = [
	[/\baddressLine\b/, /"addressLine"/],
	[/\bcity\b/, /"city"/],
	[/\bstate\b/, /"state"/],
	[/\bregion\b/, /"region"/],
	[/\bdistributionRegion\b/, /"distributionRegion"/],
	[/\bcoverage\b/, /"coverage"/],
	[/\bscope\b/, /"scope"/],
] as const;

describe('Store schema migration', () => {
	it('declares every extended Store field in Prisma schema and migration', async () => {
		const [schema, migration] = await Promise.all([
			// eslint-disable-next-line security/detect-non-literal-fs-filename -- fixed test fixture relative to this module
			readFile(
				new URL('../../../../../../prisma/schema.prisma', import.meta.url),
				'utf8',
			),
			// eslint-disable-next-line security/detect-non-literal-fs-filename -- fixed migration fixture relative to this module
			readFile(
				new URL(
					'../../../../../../prisma/migrations/20260605143000_extend_store_fields/migration.sql',
					import.meta.url,
				),
				'utf8',
			),
		]);

		for (const [schemaPattern, migrationPattern] of STORE_FIELD_PATTERNS) {
			assert.match(schema, schemaPattern);
			assert.match(migration, migrationPattern);
		}
	});
});

describe('StoreMapper', () => {
	it('maps extended fields from persistence to domain and back', () => {
		const record = {
			addressLine: 'Av. Andrômeda, 885',
			city: 'São José dos Campos',
			coverage: 'SP',
			distributionRegion: 'Sudeste',
			id: '11111111-1111-4111-8111-111111111111',
			name: 'Loja SJC',
			region: 'São José dos Campos - SP',
			scope: 'Abrangência: São José dos Campos e região.',
			state: 'SP',
		};

		const store = StoreMapper.toDomain(record);
		const mappedRecord = StoreMapper.toRecord(store);

		assert.equal(store.addressLine, record.addressLine);
		assert.equal(store.city, record.city);
		assert.equal(store.state, record.state);
		assert.deepEqual(mappedRecord, record);
	});
});
