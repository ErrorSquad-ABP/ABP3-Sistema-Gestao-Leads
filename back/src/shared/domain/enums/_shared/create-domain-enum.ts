import { DomainValidationError } from '../../errors/domain-validation.error.js';

type DomainEnumContext = Readonly<Record<string, string | number | boolean>>;

type DomainEnumConfig<TValues extends readonly string[]> = {
	readonly code: `enum.${string}.invalid_value`;
	readonly label: string;
	readonly values: TValues;
	readonly normalize?: (value: string) => string;
	readonly allowNormalization?: boolean;
	readonly context?: DomainEnumContext;
};

type DomainEnum<TValues extends readonly string[]> = {
	readonly values: TValues;
	readonly is: (value: unknown) => value is TValues[number];
	readonly isCanonical: (value: unknown) => value is TValues[number];
	readonly parse: (value: unknown) => TValues[number];
	readonly parseCanonical: (value: unknown) => TValues[number];
	readonly assert: (value: unknown) => TValues[number];
	readonly assertCanonical: (value: unknown) => TValues[number];
};

function createDomainEnum<TValues extends readonly string[]>(
	config: DomainEnumConfig<TValues>,
): DomainEnum<TValues> {
	if (config.values.length === 0) {
		throw new Error(`${config.label} must define at least one allowed value`);
	}

	const uniqueValues = new Set<string>(config.values);
	if (uniqueValues.size !== config.values.length) {
		throw new Error(
			`${config.label} enum configuration contains duplicated values`,
		);
	}

	const values = Object.freeze([...config.values]) as TValues;
	const allowNormalization = config.allowNormalization ?? true;

	const normalize =
		config.normalize ?? ((value: string): string => value.trim().toUpperCase());

	const normalizedToCanonical = new Map<string, TValues[number]>();
	for (const configuredValue of values) {
		const normalizedConfiguredValue = normalize(configuredValue);
		if (normalizedConfiguredValue !== configuredValue) {
			throw new Error(
				`${config.label} enum values must already be in canonical format`,
			);
		}

		if (normalizedToCanonical.has(normalizedConfiguredValue)) {
			throw new Error(
				`${config.label} enum configuration contains normalization collisions`,
			);
		}

		normalizedToCanonical.set(normalizedConfiguredValue, configuredValue);
	}

	const isCanonical = (value: unknown): value is TValues[number] =>
		typeof value === 'string' && normalizedToCanonical.has(value);

	const truncate = (value: string, maxLength = 160): string =>
		value.length <= maxLength
			? value
			: `${value.slice(0, maxLength)}...[truncated]`;

	const stringifyForContext = (value: unknown): string => {
		if (typeof value === 'string') {
			return truncate(value);
		}

		if (value === null) {
			return 'null';
		}

		if (value === undefined) {
			return 'undefined';
		}

		if (typeof value === 'number' || typeof value === 'boolean') {
			return String(value);
		}

		if (typeof value === 'bigint') {
			return `${value.toString()}n`;
		}

		if (typeof value === 'symbol') {
			return value.toString();
		}

		if (typeof value === 'function') {
			return `[Function: ${value.name || 'anonymous'}]`;
		}

		try {
			const json = JSON.stringify(value);
			if (json) {
				return truncate(json);
			}
		} catch {
			// Fall through to safe object tag below.
		}

		return Object.prototype.toString.call(value);
	};

	const createError = (value: unknown, reason: string): DomainValidationError =>
		new DomainValidationError(
			`${config.label} must be one of: ${config.values.join(', ')}`,
			{
				code: config.code,
				context: {
					reason,
					receivedType: value === null ? 'null' : typeof value,
					receivedValue: stringifyForContext(value),
					allowedValues: config.values.join(', '),
					...(config.context ?? {}),
				},
			},
		);

	const normalizeInput = (value: unknown): string => {
		if (typeof value !== 'string') {
			throw createError(value, 'non_string_input');
		}

		let normalized = '';
		try {
			normalized = normalize(value);
		} catch {
			throw createError(value, 'normalizer_threw_exception');
		}

		if (typeof normalized !== 'string') {
			throw createError(value, 'invalid_normalizer_output');
		}

		return normalized;
	};

	const parseCanonical = (value: unknown): TValues[number] => {
		const normalized = normalizeInput(value);
		if (normalized !== value) {
			throw createError(value, 'non_canonical_input');
		}

		const canonical = normalizedToCanonical.get(normalized);
		if (!canonical) {
			throw createError(value, 'unknown_enum_value');
		}

		return canonical;
	};

	const parseWithNormalization = (value: unknown): TValues[number] => {
		const normalized = normalizeInput(value);
		const canonical = normalizedToCanonical.get(normalized);
		if (!canonical) {
			throw createError(value, 'unknown_enum_value');
		}

		return canonical;
	};

	const parse = (value: unknown): TValues[number] =>
		allowNormalization ? parseWithNormalization(value) : parseCanonical(value);

	const assertCanonical = (value: unknown): TValues[number] =>
		parseCanonical(value);

	const assert = (value: unknown): TValues[number] => parse(value);

	const is = (value: unknown): value is TValues[number] => {
		if (allowNormalization) {
			try {
				parse(value);
				return true;
			} catch {
				return false;
			}
		}

		return isCanonical(value);
	};

	return {
		values,
		is,
		isCanonical,
		parse,
		parseCanonical,
		assert,
		assertCanonical,
	};
}

export type { DomainEnum, DomainEnumConfig, DomainEnumContext };
export { createDomainEnum };
