type ApiErrorItem = {
	readonly code: string;
	readonly message: string;
	readonly field?: string;
	readonly details?: Readonly<Record<string, unknown>>;
};

type ApiSuccessEnvelope<T = unknown> = {
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

type ApiResponseEnvelope<T = unknown> =
	| ApiSuccessEnvelope<T>
	| ApiErrorEnvelope;

export type {
	ApiErrorEnvelope,
	ApiErrorItem,
	ApiResponseEnvelope,
	ApiSuccessEnvelope,
};
