import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

import type { StoreRecord } from '../model/stores.model';
import { resolveStoreProfile } from './store-view';

describe('store-view real API data', () => {
	it('builds the catalog profile from persisted API fields', () => {
		const store: StoreRecord = {
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

		assert.deepEqual(resolveStoreProfile(store), {
			addressLine: store.addressLine,
			cityState: 'São José dos Campos, SP',
			coverage: store.coverage,
			distributionRegion: store.distributionRegion,
			region: store.region,
			scope: store.scope,
			state: store.state,
		});
	});

	it('keeps the previous catalog-view mock removed from the codebase', async () => {
		await assert.rejects(
			access(new URL('./store-catalog-view.ts', import.meta.url)),
		);

		// eslint-disable-next-line security/detect-non-literal-fs-filename -- fixed path relative to this spec module
		const source = await readFile(
			'src/features/stores/lib/store-view.ts',
			'utf8',
		);
		assert.doesNotMatch(source, /name\.includes|cacapava|sjc|matriz/i);
	});
});
