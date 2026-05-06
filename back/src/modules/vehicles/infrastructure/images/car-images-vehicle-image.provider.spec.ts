import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { env } from '../../../../config/env.js';
import { CarImagesVehicleImageProvider } from './car-images-vehicle-image.provider.js';

const originalApiKey = env.carImagesApiKey;
const originalFetch = globalThis.fetch;

afterEach(() => {
	env.carImagesApiKey = originalApiKey;
	globalThis.fetch = originalFetch;
});

describe('CarImagesVehicleImageProvider', () => {
	it('returns null without API key', async () => {
		env.carImagesApiKey = '';

		const provider = new CarImagesVehicleImageProvider();
		const result = await provider.resolve({
			brand: 'Volkswagen',
			model: 'Golf',
			modelYear: 2022,
		});

		assert.equal(result, null);
	});

	it('maps signed URLs into transient vehicle image metadata', async () => {
		env.carImagesApiKey = 'test-key';
		const requests: string[] = [];
		const expires = Math.floor((Date.now() + 60 * 60 * 1000) / 1000);
		globalThis.fetch = async (input) => {
			requests.push(String(input));
			return new Response(
				JSON.stringify({
					url: `https://carimagesapi.com/image?make=Volkswagen&model=Golf&expires=${expires}&sig=abc`,
				}),
				{ status: 200 },
			);
		};

		const provider = new CarImagesVehicleImageProvider();
		const result = await provider.resolve({
			brand: 'Volkswagen',
			model: 'Golf',
			modelYear: 2022,
		});

		assert.equal(
			result?.imageUrl,
			`https://carimagesapi.com/image?make=Volkswagen&model=Golf&expires=${expires}&sig=abc`,
		);
		assert.equal(result?.imageAlt, 'Volkswagen Golf 2022');
		assert.equal(result?.imageProvider, 'carimages');
		assert.equal(result?.imageSourceUrl, 'https://carimagesapi.com/');
		assert.equal(result?.imageExpiresAt?.getTime(), expires * 1000);
		assert.equal(requests.length, 1);
		assert.match(requests[0] ?? '', /signed-url/);
		assert.match(requests[0] ?? '', /api_key=test-key/);
	});

	it('caches signed URL metadata briefly', async () => {
		env.carImagesApiKey = 'test-key';
		let calls = 0;
		globalThis.fetch = async () => {
			calls += 1;
			const expires = Math.floor((Date.now() + 60 * 60 * 1000) / 1000);
			return new Response(
				JSON.stringify({
					url: `https://carimagesapi.com/image?make=Jeep&model=Compass&expires=${expires}&sig=abc`,
				}),
				{ status: 200 },
			);
		};

		const provider = new CarImagesVehicleImageProvider();
		const input = { brand: 'Jeep', model: 'Compass', modelYear: 2023 };

		await provider.resolve(input);
		await provider.resolve(input);

		assert.equal(calls, 1);
	});
});
