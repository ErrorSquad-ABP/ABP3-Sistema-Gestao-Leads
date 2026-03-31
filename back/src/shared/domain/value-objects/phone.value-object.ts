import { DomainValidationError } from '../errors/domain-validation.error.js';

class Phone {
	private static readonly MIN_DIGITS = 10;
	private static readonly MAX_DIGITS = 15;
	private static readonly ALLOWED_INPUT_REGEX = /^[+\d\s().-]+$/;
	private static readonly E164_REGEX = /^\+?[1-9]\d{9,14}$/;

	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	static create(value: string): Phone {
		const raw = value.trim();

		if (raw.length === 0) {
			throw new DomainValidationError('Phone cannot be empty', {
				code: 'phone.empty',
			});
		}

		if (!Phone.ALLOWED_INPUT_REGEX.test(raw)) {
			throw new DomainValidationError(
				'Phone contains invalid characters. Use digits, spaces, parentheses, dots, hyphens and optional leading +',
				{ code: 'phone.invalid_characters' },
			);
		}

		const plusCount = [...raw].filter((char) => char === '+').length;

		if (plusCount > 1) {
			throw new DomainValidationError(
				'Phone can contain at most one + character',
				{
					code: 'phone.multiple_plus',
				},
			);
		}

		if (plusCount === 1 && !raw.startsWith('+')) {
			throw new DomainValidationError(
				'Phone can contain + only at the beginning',
				{
					code: 'phone.plus_position',
				},
			);
		}

		if (raw.startsWith('+') && /\+\s/.test(raw)) {
			throw new DomainValidationError(
				'Phone cannot contain whitespace right after +',
				{ code: 'phone.plus_whitespace' },
			);
		}

		const hasLeadingPlus = raw.charAt(0) === '+';
		const digits = raw.replace(/\D/g, '');

		if (digits.length < Phone.MIN_DIGITS || digits.length > Phone.MAX_DIGITS) {
			throw new DomainValidationError(
				`Phone must contain between ${Phone.MIN_DIGITS} and ${Phone.MAX_DIGITS} digits`,
				{
					code: 'phone.invalid_length',
					context: {
						minDigits: Phone.MIN_DIGITS,
						maxDigits: Phone.MAX_DIGITS,
					},
				},
			);
		}

		const normalized = `${hasLeadingPlus ? '+' : ''}${digits}`;

		if (!Phone.E164_REGEX.test(normalized)) {
			throw new DomainValidationError(
				'Phone must be a valid E.164-like number with country code',
				{ code: 'phone.invalid_e164' },
			);
		}

		return new Phone(normalized);
	}

	static from(value: string): Phone {
		return Phone.create(value);
	}

	get value(): string {
		return this._value;
	}

	equals(other: Phone): boolean {
		return this._value === other.value;
	}

	toString(): string {
		return this._value;
	}
}

export { Phone };
