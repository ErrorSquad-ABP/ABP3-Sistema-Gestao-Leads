class PasswordHash {
	private static readonly MIN_LENGTH = 20;
	private static readonly MAX_LENGTH = 200;
	private static readonly BCRYPT_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
	private static readonly ARGON2_REGEX =
		/^\$argon2(?:id|i|d)\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/;
	private static readonly SCRYPT_REGEX =
		/^\$scrypt\$ln=\d+,r=\d+,p=\d+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/;

	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	static create(value: string): PasswordHash {
		const normalized = value.trim();

		if (normalized.length < PasswordHash.MIN_LENGTH) {
			throw new Error(
				`Password hash must contain at least ${PasswordHash.MIN_LENGTH} characters`,
			);
		}

		if (normalized.length > PasswordHash.MAX_LENGTH) {
			throw new Error(
				`Password hash must contain at most ${PasswordHash.MAX_LENGTH} characters`,
			);
		}

		if (/\s/.test(normalized)) {
			throw new Error('Password hash cannot contain whitespace characters');
		}

		const isSupportedHash =
			PasswordHash.BCRYPT_REGEX.test(normalized) ||
			PasswordHash.ARGON2_REGEX.test(normalized) ||
			PasswordHash.SCRYPT_REGEX.test(normalized);

		if (!isSupportedHash) {
			throw new Error(
				'Password hash must be a valid bcrypt, argon2 or scrypt hash string',
			);
		}

		return new PasswordHash(normalized);
	}

	static from(value: string): PasswordHash {
		return PasswordHash.create(value);
	}

	get value(): string {
		return this._value;
	}

	equals(other: PasswordHash): boolean {
		return this._value === other.value;
	}

	toString(): string {
		return this._value;
	}
}

export { PasswordHash };
