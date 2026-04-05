import { env } from '../env';
import {
	ApiError,
	type ApiResponseEnvelope,
	isApiErrorEnvelope,
} from './api-error';

type HttpMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
type PrimitiveQuery = string | number | boolean | null | undefined;
type Parser<T> = (value: unknown) => T;

type RequestOptions<TResponse> = {
	readonly path: string;
	readonly method?: HttpMethod;
	readonly body?: unknown;
	readonly headers?: HeadersInit;
	readonly query?: Readonly<Record<string, PrimitiveQuery>>;
	readonly parser?: Parser<TResponse>;
	readonly signal?: AbortSignal;
};

function buildUrl(
	path: string,
	query?: Readonly<Record<string, PrimitiveQuery>>,
) {
	const normalizedPath = path.startsWith('/api/') ? path : `/api${path}`;
	const url = new URL(normalizedPath, env.publicApiUrl);

	if (query) {
		for (const [key, value] of Object.entries(query)) {
			if (value === undefined || value === null || value === '') {
				continue;
			}

			url.searchParams.set(key, String(value));
		}
	}

	return url;
}

async function parseResponseBody(response: Response): Promise<unknown> {
	if (response.status === 204) {
		return null;
	}

	const contentType = response.headers.get('content-type') ?? '';
	if (!contentType.includes('application/json')) {
		return null;
	}

	return response.json();
}

async function request<TResponse>({
	path,
	method = 'GET',
	body,
	headers,
	query,
	parser,
	signal,
}: RequestOptions<TResponse>): Promise<TResponse> {
	const response = await fetch(buildUrl(path, query), {
		method,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		body: body === undefined ? undefined : JSON.stringify(body),
		cache: 'no-store',
		signal,
	});

	const rawBody = await parseResponseBody(response);

	if (!response.ok) {
		if (isApiErrorEnvelope(rawBody)) {
			throw new ApiError({
				message: rawBody.message ?? 'Falha na integração HTTP.',
				status: response.status,
				errors: rawBody.errors,
			});
		}

		throw new ApiError({
			message: `Falha na integração HTTP (${response.status}).`,
			status: response.status,
		});
	}

	if (response.status === 204) {
		return undefined as TResponse;
	}

	const envelope = rawBody as ApiResponseEnvelope<unknown>;
	const data = envelope?.data ?? null;

	return parser ? parser(data) : (data as TResponse);
}

function createHttpResource(basePath: string) {
	return {
		create<TResponse, TBody>(body: TBody, parser?: Parser<TResponse>) {
			return request<TResponse>({
				path: basePath,
				method: 'POST',
				body,
				parser,
			});
		},
		findById<TResponse>(id: string, parser?: Parser<TResponse>) {
			return request<TResponse>({
				path: `${basePath}/${id}`,
				parser,
			});
		},
		list<TResponse>(
			parser?: Parser<TResponse>,
			query?: Readonly<Record<string, PrimitiveQuery>>,
		) {
			return request<TResponse>({
				path: basePath,
				parser,
				query,
			});
		},
		remove(id: string) {
			return request<void>({
				path: `${basePath}/${id}`,
				method: 'DELETE',
			});
		},
		update<TResponse, TBody>(
			id: string,
			body: TBody,
			parser?: Parser<TResponse>,
		) {
			return request<TResponse>({
				path: `${basePath}/${id}`,
				method: 'PATCH',
				body,
				parser,
			});
		},
	};
}

const apiClient = {
	createHttpResource,
	delete: <TResponse>(path: string, parser?: Parser<TResponse>) =>
		request<TResponse>({ path, method: 'DELETE', parser }),
	get: <TResponse>(
		path: string,
		parser?: Parser<TResponse>,
		query?: Readonly<Record<string, PrimitiveQuery>>,
	) => request<TResponse>({ path, parser, query }),
	patch: <TResponse, TBody>(
		path: string,
		body: TBody,
		parser?: Parser<TResponse>,
	) => request<TResponse>({ path, method: 'PATCH', body, parser }),
	post: <TResponse, TBody>(
		path: string,
		body: TBody,
		parser?: Parser<TResponse>,
	) => request<TResponse>({ path, method: 'POST', body, parser }),
	request,
};

export type { Parser, RequestOptions };
export { apiClient };
