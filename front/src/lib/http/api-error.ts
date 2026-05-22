type ApiErrorItem = {
	code: string;
	message: string;
	details?: Readonly<Record<string, unknown>>;
};

class ApiError extends Error {
	readonly status: number;
	readonly code: string | null;
	readonly details: Readonly<Record<string, unknown>> | null;
	readonly errors: readonly ApiErrorItem[];

	constructor(
		message: string,
		status: number,
		options?: {
			code?: string | null;
			details?: Readonly<Record<string, unknown>> | null;
			errors?: readonly ApiErrorItem[];
		},
	) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.code = options?.code ?? null;
		this.details = options?.details ?? null;
		this.errors = options?.errors ?? [];
	}
}

function isApiError(error: unknown): error is ApiError {
	return error instanceof ApiError;
}

export type { ApiErrorItem };
export { ApiError, isApiError };
