type ApiErrorItem = {
	readonly code: string;
	readonly message: string;
	readonly field?: string;
	readonly details?: Readonly<Record<string, unknown>>;
};

type ApiSuccessEnvelope<T> = {
	readonly success: true;
	readonly message: string | null;
	readonly data: T | null;
	readonly errors: null;
};

type ApiErrorEnvelope = {
	readonly success: false;
	readonly message: string | null;
	readonly data: null;
	readonly errors: readonly ApiErrorItem[];
};

type ApiResponseEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

class ApiError extends Error {
	readonly status: number;
	readonly errors: readonly ApiErrorItem[];

	constructor(params: {
		readonly message: string;
		readonly status: number;
		readonly errors?: readonly ApiErrorItem[];
	}) {
		super(params.message);
		this.name = 'ApiError';
		this.status = params.status;
		this.errors = params.errors ?? [];
	}
}

function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const envelope = value as Partial<ApiErrorEnvelope>;
	return envelope.success === false && Array.isArray(envelope.errors);
}

export type {
	ApiErrorEnvelope,
	ApiErrorItem,
	ApiResponseEnvelope,
	ApiSuccessEnvelope,
};
export { ApiError, isApiErrorEnvelope };
