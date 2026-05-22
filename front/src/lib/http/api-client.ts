import { env } from '../env';
import { ApiError, type ApiErrorItem } from './api-error';
import { getAccessToken } from '@/lib/auth/access-token';

type ApiSuccessEnvelope<TData> = {
	success: true;
	message: string | null;
	data: TData;
	errors: null;
};

type ApiErrorEnvelope = {
	success: false;
	message: string;
	data: null;
	errors: ApiErrorItem[] | null;
};

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
	body?: BodyInit | FormData | URLSearchParams | Record<string, unknown> | null;
	timeoutMs?: number;
};

function buildApiUrl(path: string) {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${env.publicApiUrl.replace(/\/$/, '')}${normalizedPath}`;
}

function isPlainObjectBody(
	body: ApiFetchOptions['body'],
): body is Record<string, unknown> {
	return (
		body !== null &&
		body !== undefined &&
		!(body instanceof FormData) &&
		!(body instanceof URLSearchParams) &&
		typeof body !== 'string' &&
		!(body instanceof Blob) &&
		!(body instanceof ArrayBuffer)
	);
}

function isEnvelope(
	payload: unknown,
): payload is ApiSuccessEnvelope<unknown> | ApiErrorEnvelope {
	if (typeof payload !== 'object' || payload === null) {
		return false;
	}

	return 'success' in payload && 'data' in payload;
}

function toApiError(status: number, payload: unknown) {
	if (isEnvelope(payload) && payload.success === false) {
		const firstError = payload.errors?.[0];

		return new ApiError(payload.message, status, {
			code: firstError?.code ?? null,
			details: firstError?.details ?? null,
			errors: payload.errors ?? [],
		});
	}

	if (
		typeof payload === 'object' &&
		payload !== null &&
		'message' in payload &&
		typeof payload.message === 'string'
	) {
		return new ApiError(payload.message, status);
	}

	return new ApiError(`API request failed with status ${status}.`, status);
}

async function parseResponseBody(response: Response) {
	if (response.status === 204) {
		return null;
	}

	const contentType = response.headers.get('content-type') ?? '';
	if (!contentType.includes('application/json')) {
		return null;
	}

	return (await response.json()) as unknown;
}

async function apiFetch<TData>(path: string, options: ApiFetchOptions = {}) {
	const headers = new Headers(options.headers);
	headers.set('Accept', 'application/json');
	const accessToken = getAccessToken();
	if (accessToken && !headers.has('Authorization')) {
		headers.set('Authorization', `Bearer ${accessToken}`);
	}
	const controller = new AbortController();
	const timeoutMs = options.timeoutMs ?? 8_000;
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	let body: BodyInit | null | undefined;

	if (isPlainObjectBody(options.body)) {
		headers.set('Content-Type', 'application/json');
		body = JSON.stringify(options.body);
	} else {
		body = options.body as BodyInit | null | undefined;
	}

	try {
		const response = await fetch(buildApiUrl(path), {
			...options,
			body,
			cache: options.cache ?? 'no-store',
			credentials: options.credentials ?? 'include',
			headers,
			signal: options.signal ?? controller.signal,
		});

		const payload = await parseResponseBody(response);

		if (!response.ok) {
			throw toApiError(response.status, payload);
		}

		if (isEnvelope(payload) && payload.success === true) {
			return payload.data as TData;
		}

		return payload as TData;
	} catch (error) {
		if (error instanceof DOMException && error.name === 'AbortError') {
			throw new ApiError(
				'A requisição excedeu o tempo limite de resposta da API.',
				408,
				{
					code: 'request.timeout',
				},
			);
		}

		if (error instanceof TypeError) {
			throw new ApiError('Não foi possível conectar à API no momento.', 503, {
				code: 'network.unreachable',
			});
		}

		throw error;
	} finally {
		clearTimeout(timeoutId);
	}
}

export { apiFetch, buildApiUrl };
