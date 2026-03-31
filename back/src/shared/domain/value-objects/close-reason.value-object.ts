class CloseReason {
	private static readonly MIN_LENGTH = 3;
	private static readonly MAX_LENGTH = 255;

	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	static create(value: string): CloseReason {
		const normalized = value.trim().replace(/\s+/g, ' ');

		if (normalized.length < CloseReason.MIN_LENGTH) {
			throw new Error(
				`Close reason must contain at least ${CloseReason.MIN_LENGTH} characters`,
			);
		}

		if (normalized.length > CloseReason.MAX_LENGTH) {
			throw new Error(
				`Close reason must contain at most ${CloseReason.MAX_LENGTH} characters`,
			);
		}

		if (CloseReason.hasControlCharacters(normalized)) {
			throw new Error('Close reason cannot contain control characters');
		}

		if (!CloseReason.hasMeaningfulContent(normalized)) {
			throw new Error(
				'Close reason must contain at least one letter or number character',
			);
		}

		return new CloseReason(normalized);
	}

	static from(value: string): CloseReason {
		return CloseReason.create(value);
	}

	get value(): string {
		return this._value;
	}

	equals(other: CloseReason): boolean {
		return this._value === other.value;
	}

	toString(): string {
		return this._value;
	}

	private static hasMeaningfulContent(value: string): boolean {
		return [...value].some((char) => /\p{L}|\p{N}/u.test(char));
	}

	private static hasControlCharacters(value: string): boolean {
		return [...value].some((char) => {
			const codePoint = char.codePointAt(0) ?? 0;
			return codePoint <= 0x1f || codePoint === 0x7f;
		});
	}
}

export { CloseReason };
