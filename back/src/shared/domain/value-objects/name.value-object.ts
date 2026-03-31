class Name {
	private static readonly MIN_LENGTH = 2;
	private static readonly MAX_LENGTH = 120;
	private static readonly ALLOWED_CHARACTERS_REGEX = /^[\p{L}\p{M}' -]+$/u;

	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	static create(value: string): Name {
		const normalized = value.trim().replace(/\s+/g, ' ');

		if (normalized.length < Name.MIN_LENGTH) {
			throw new Error(
				`Name must contain at least ${Name.MIN_LENGTH} characters`,
			);
		}

		if (normalized.length > Name.MAX_LENGTH) {
			throw new Error(
				`Name must contain at most ${Name.MAX_LENGTH} characters`,
			);
		}

		if (!Name.ALLOWED_CHARACTERS_REGEX.test(normalized)) {
			throw new Error(
				'Name contains invalid characters. Use letters, spaces, apostrophes or hyphens',
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
