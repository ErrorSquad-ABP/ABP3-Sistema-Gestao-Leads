type DomainValidationDetails = {
	readonly code: string;
	readonly context?: Readonly<Record<string, string | number | boolean>>;
};

class DomainValidationError extends Error {
	readonly code: string;
	readonly context?: Readonly<Record<string, string | number | boolean>>;

	constructor(message: string, details: DomainValidationDetails) {
		super(message);
		this.name = 'DomainValidationError';
		this.code = details.code;
		this.context = details.context;
	}
}

export { DomainValidationError };
export type { DomainValidationDetails };
