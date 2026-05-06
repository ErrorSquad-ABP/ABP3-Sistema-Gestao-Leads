import { Injectable } from '@nestjs/common';

import { env } from '../../../../config/env.js';
import type { VehicleImageMetadata } from '../../domain/entities/vehicle.entity.js';
import type {
	VehicleImageLookupInput,
	VehicleImageProvider,
} from '../../application/services/vehicle-image-provider.js';

type CarImagesSignedUrlResponse = {
	readonly url?: unknown;
};

type CachedImage = {
	readonly expiresAt: number;
	readonly metadata: VehicleImageMetadata;
};

const SIGNED_URL_ENDPOINT = 'https://carimagesapi.com/api/v1/signed-url';
const REQUEST_TIMEOUT_MS = 2_500;
const FALLBACK_SIGNED_URL_TTL_MS = 24 * 60 * 60 * 1000;
const REFRESH_SAFETY_MARGIN_MS = 5 * 60 * 1000;
const IMAGE_WIDTH = '800';
const IMAGE_FORMAT = 'webp';

function normalizeVehiclePart(value: string) {
	return value.trim().replace(/\s+/g, ' ');
}

function isSignedUrlResponse(
	value: unknown,
): value is CarImagesSignedUrlResponse {
	return typeof value === 'object' && value !== null && 'url' in value;
}

function buildCacheKey(input: VehicleImageLookupInput) {
	return [
		normalizeVehiclePart(input.brand).toLowerCase(),
		normalizeVehiclePart(input.model).toLowerCase(),
		String(input.modelYear),
		IMAGE_WIDTH,
		IMAGE_FORMAT,
	].join('|');
}

function unixTimestampToDate(value: string): Date | null {
	const timestamp = Number(value);
	if (!Number.isFinite(timestamp) || timestamp <= 0) {
		return null;
	}

	const milliseconds = timestamp > 9_999_999_999 ? timestamp : timestamp * 1000;
	const date = new Date(milliseconds);
	return Number.isNaN(date.getTime()) ? null : date;
}

function parseCarImagesExpiresAt(signedUrl: string, now: Date): Date {
	try {
		const url = new URL(signedUrl);
		const expires =
			url.searchParams.get('expires') ??
			url.searchParams.get('exp') ??
			url.searchParams.get('Expires');
		const parsed = expires ? unixTimestampToDate(expires) : null;
		if (parsed && parsed.getTime() > now.getTime()) {
			return parsed;
		}
	} catch {
		// The provider should return absolute URLs, but a conservative TTL keeps
		// the catalog usable if the URL shape changes.
	}

	return new Date(now.getTime() + FALLBACK_SIGNED_URL_TTL_MS);
}

function cacheExpiresAt(imageExpiresAt: Date): number {
	return Math.max(0, imageExpiresAt.getTime() - REFRESH_SAFETY_MARGIN_MS);
}

@Injectable()
class CarImagesVehicleImageProvider implements VehicleImageProvider {
	private readonly cache = new Map<string, CachedImage>();

	async resolve(
		input: VehicleImageLookupInput,
	): Promise<VehicleImageMetadata | null> {
		if (!env.carImagesApiKey) {
			return null;
		}

		const cacheKey = buildCacheKey(input);
		const cached = this.cache.get(cacheKey);
		const nowMs = Date.now();
		if (cached && cached.expiresAt > nowMs) {
			return cached.metadata;
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
		const make = normalizeVehiclePart(input.brand);
		const model = normalizeVehiclePart(input.model);
		const label = `${make} ${model} ${input.modelYear}`;
		const url = new URL(SIGNED_URL_ENDPOINT);
		url.searchParams.set('api_key', env.carImagesApiKey);
		url.searchParams.set('make', make);
		url.searchParams.set('model', model);
		url.searchParams.set('year', String(input.modelYear));
		url.searchParams.set('width', IMAGE_WIDTH);
		url.searchParams.set('format', IMAGE_FORMAT);

		try {
			const response = await fetch(url, {
				headers: { Accept: 'application/json' },
				signal: controller.signal,
			});
			if (!response.ok) {
				return null;
			}

			const payload = (await response.json()) as unknown;
			if (!isSignedUrlResponse(payload) || typeof payload.url !== 'string') {
				return null;
			}

			const now = new Date();
			const imageExpiresAt = parseCarImagesExpiresAt(payload.url, now);
			const metadata: VehicleImageMetadata = {
				imageUrl: payload.url,
				imageAlt: label,
				imageProvider: 'carimages',
				imageProviderPhotoId: null,
				imagePhotographerName: null,
				imagePhotographerUrl: null,
				imageSourceUrl: 'https://carimagesapi.com/',
				imageResolvedAt: now,
				imageExpiresAt,
			};
			this.cache.set(cacheKey, {
				expiresAt: cacheExpiresAt(imageExpiresAt),
				metadata,
			});
			return metadata;
		} catch {
			return null;
		} finally {
			clearTimeout(timeoutId);
		}
	}
}

export { CarImagesVehicleImageProvider };
