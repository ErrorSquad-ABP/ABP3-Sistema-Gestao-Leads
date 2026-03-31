import { DomainValidationError } from '../errors/domain-validation.error.js';

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
			throw new DomainValidationError(
				`Password hash must contain at least ${PasswordHash.MIN_LENGTH} characters`,
				{
					code: 'password_hash.too_short',
					context: { minLength: PasswordHash.MIN_LENGTH },
				},
			);
		}

		if (normalized.length > PasswordHash.MAX_LENGTH) {
			throw new DomainValidationError(
				`Password hash must contain at most ${PasswordHash.MAX_LENGTH} characters`,
				{
					code: 'password_hash.too_long',
					context: { maxLength: PasswordHash.MAX_LENGTH },
				},
			);
		}

		if (/\s/.test(normalized)) {
			throw new DomainValidationError(
				'Password hash cannot contain whitespace characters',
				{ code: 'password_hash.whitespace_not_allowed' },
			);
		}

		PasswordHash.assertSupportedHash(normalized);

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

	private static assertSupportedHash(value: string): void {
		if (PasswordHash.BCRYPT_REGEX.test(value)) {
			PasswordHash.assertBcryptWorkFactor(value);
			return;
		}

		if (PasswordHash.ARGON2_REGEX.test(value)) {
			PasswordHash.assertArgon2Params(value);
			return;
		}

		if (PasswordHash.SCRYPT_REGEX.test(value)) {
			PasswordHash.assertScryptParams(value);
			return;
		}

		throw new DomainValidationError(
			'Password hash must be a valid bcrypt, argon2 or scrypt hash string',
			{ code: 'password_hash.unsupported_format' },
		);
	}

	private static assertBcryptWorkFactor(value: string): void {
		const parts = value.split('$');
		const costRaw = parts[2] ?? '';
		const cost = Number.parseInt(costRaw, 10);

		if (Number.isNaN(cost) || cost < 10) {
			throw new DomainValidationError(
				'Bcrypt hash must use work factor >= 10',
				{ code: 'password_hash.bcrypt_weak_cost', context: { minCost: 10 } },
			);
		}
	}

	private static assertArgon2Params(value: string): void {
		const paramsSection = value.split('$')[3] ?? '';
		const parts = paramsSection.split(',');
		const values = new Map<string, number>();

		for (const part of parts) {
			const [key, raw] = part.split('=');
			if (key && raw) {
				values.set(key, Number.parseInt(raw, 10));
			}
		}

		const memory = values.get('m') ?? 0;
		const iterations = values.get('t') ?? 0;
		const parallelism = values.get('p') ?? 0;

		if (memory < 19456 || iterations < 2 || parallelism < 1) {
			throw new DomainValidationError(
				'Argon2 hash must use secure params (m>=19456, t>=2, p>=1)',
				{
					code: 'password_hash.argon2_weak_params',
					context: { minMemory: 19456, minIterations: 2, minParallelism: 1 },
				},
			);
		}
	}

	private static assertScryptParams(value: string): void {
		const paramsSection = value.split('$')[2] ?? '';
		const parts = paramsSection.split(',');
		const values = new Map<string, number>();

		for (const part of parts) {
			const [key, raw] = part.split('=');
			if (key && raw) {
				values.set(key, Number.parseInt(raw, 10));
			}
		}

		const logN = values.get('ln') ?? 0;
		const blockSize = values.get('r') ?? 0;
		const parallelism = values.get('p') ?? 0;

		if (logN < 14 || blockSize < 8 || parallelism < 1) {
			throw new DomainValidationError(
				'Scrypt hash must use secure params (ln>=14, r>=8, p>=1)',
				{
					code: 'password_hash.scrypt_weak_params',
					context: { minLogN: 14, minBlockSize: 8, minParallelism: 1 },
				},
			);
		}
	}
}

export { PasswordHash };
