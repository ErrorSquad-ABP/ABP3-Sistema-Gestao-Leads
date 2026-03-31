import { DomainValidationError } from '../../errors/domain-validation.error.js';

type DomainEnumContext = Readonly<Record<string, string | number | boolean>>;

type DomainEnumConfig<TValues extends readonly string[]> = {
	readonly code: `enum.${string}.invalid_value`;
	readonly label: string;
	readonly values: TValues;
	readonly normalize?: (value: string) => string;
	readonly context?: DomainEnumContext;
};

type DomainEnum<TValues extends readonly string[]> = {
	readonly values: TValues;
	readonly is: (value: string) => value is TValues[number];
	readonly parse: (value: string) => TValues[number];
	readonly assert: (value: string) => asserts value is TValues[number];
};

function createDomainEnum<TValues extends readonly string[]>(
	config: DomainEnumConfig<TValues>,
): DomainEnum<TValues> {
	Object.freeze(config.values);
	const valueSet = new Set<string>(config.values);

	const is = (value: string): value is TValues[number] => valueSet.has(value);

	const normalize =
		config.normalize ?? ((value: string): string => value.trim().toUpperCase());

	const createError = (): DomainValidationError =>
		new DomainValidationError(
			`${config.label} must be one of: ${config.values.join(', ')}`,
			{
				code: config.code,
				context: {
					allowedValues: config.values.join(', '),
					...(config.context ?? {}),
				},
			},
		);

	const parse = (value: string): TValues[number] => {
		const normalized = normalize(value);

		if (!is(normalized)) {
			throw createError();
		}

		return normalized;
	};

	const assert = (value: string): asserts value is TValues[number] => {
		if (!is(value)) {
			throw createError();
		}
	};

	return {
		values: config.values,
		is,
		parse,
		assert,
	};
}

export { createDomainEnum };
export type { DomainEnum, DomainEnumConfig, DomainEnumContext };
