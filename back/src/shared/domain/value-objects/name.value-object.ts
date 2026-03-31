import { DomainValidationError } from '../errors/domain-validation.error.js';

class Name {
	private static readonly MIN_LENGTH = 2;
	private static readonly MAX_LENGTH = 120;
	private static readonly NAME_STRUCTURE_REGEX =
		/^\p{L}[\p{L}\p{M}]*(?: \p{L}[\p{L}\p{M}]*)*$/u;

	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	static create(value: string): Name {
		const normalized = value.normalize('NFC').trim().replace(/\s+/g, ' ');

		if (normalized.length < Name.MIN_LENGTH) {
			throw new DomainValidationError(
				`Name must contain at least ${Name.MIN_LENGTH} characters`,
				{
					code: 'name.too_short',
					context: { minLength: Name.MIN_LENGTH },
				},
			);
		}

		if (normalized.length > Name.MAX_LENGTH) {
			throw new DomainValidationError(
				`Name must contain at most ${Name.MAX_LENGTH} characters`,
				{
					code: 'name.too_long',
					context: { maxLength: Name.MAX_LENGTH },
				},
			);
		}

		if (!Name.NAME_STRUCTURE_REGEX.test(normalized)) {
			throw new DomainValidationError(
				'Name contains invalid characters. Use letters only (spaces between words are allowed)',
				{ code: 'name.invalid_characters' },
			);
		}

		return new Name(normalized);
	}

	static from(value: string): Name {
		return Name.create(value);
	}

	get value(): string {
		return this._value;
	}

	equals(other: Name): boolean {
		return this._value === other.value;
	}

	toString(): string {
		return this._value;
	}
}

export { Name };
