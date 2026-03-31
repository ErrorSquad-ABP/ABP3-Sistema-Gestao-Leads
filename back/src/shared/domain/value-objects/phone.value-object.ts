class Phone {
	private static readonly MIN_DIGITS = 10;
	private static readonly MAX_DIGITS = 15;
	private static readonly ALLOWED_INPUT_REGEX = /^[+\d\s().-]+$/;

	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	static create(value: string): Phone {
		const raw = value.trim();

		if (raw.length === 0) {
			throw new Error('Phone cannot be empty');
		}

		if (!Phone.ALLOWED_INPUT_REGEX.test(raw)) {
			throw new Error(
				'Phone contains invalid characters. Use digits, spaces, parentheses, dots, hyphens and optional leading +',
			);
		}

		if (raw.includes('+') && !raw.startsWith('+')) {
			throw new Error('Phone can contain + only at the beginning');
		}

		const hasLeadingPlus = raw.charAt(0) === '+';
		const digits = raw.replace(/\D/g, '');

		if (digits.length < Phone.MIN_DIGITS || digits.length > Phone.MAX_DIGITS) {
			throw new Error(
				`Phone must contain between ${Phone.MIN_DIGITS} and ${Phone.MAX_DIGITS} digits`,
			);
		}

		const normalized = `${hasLeadingPlus ? '+' : ''}${digits}`;

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
